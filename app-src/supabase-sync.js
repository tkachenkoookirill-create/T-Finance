// T-Finance · Supabase Cloud Sync
(function () {
  'use strict';

  var SUPABASE_URL  = 'https://vimxepexjtstnfugbptx.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXhlcGV4anRzdG5mdWdicHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODE5MjMsImV4cCI6MjA5NzQ1NzkyM30.EzCoKGn55Dxi44dGra5uBcn8o3zzDl14u0rXK0m-j9U';

  var SYNC_ID_KEY = 'tf_sync_id';
  var SYNC_TS_KEY = 'tf_sync_ts';
  var DATA_KEYS   = [
    'tf_user', 'tf_accounts', 'tf_transactions', 'tf_goals',
    'tf_seeded_v1', 'tf_adv', 'tf_theme', 'tf_mig_uzs',
    'tf_an_tab', 'tf_adv_tab', 'tf_route',
  ];

  // ── Supabase client (lazy) ────────────────────────────────
  var _client = null;
  function getClient() {
    if (_client) return _client;
    if (!window.supabase) { console.warn('[TFSync] supabase-js not loaded'); return null; }
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    return _client;
  }

  // ── Sync ID (UUID per user, generated once) ───────────────
  function getSyncId() {
    var id = localStorage.getItem(SYNC_ID_KEY);
    if (!id) {
      // crypto.randomUUID is available in modern browsers
      id = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          });
      // Use _origSet to avoid triggering schedulePush
      _origSet.call(localStorage, SYNC_ID_KEY, id);
    }
    return id;
  }

  // ── Collect app data from localStorage ────────────────────
  function collect() {
    var d = {};
    DATA_KEYS.forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v != null) d[k] = v;
    });
    return d;
  }

  // ── Notify UI ─────────────────────────────────────────────
  function notify(status, ts) {
    window.dispatchEvent(new CustomEvent('tf_sync', { detail: { status: status, ts: ts || null } }));
  }

  // ── Push local → Supabase ─────────────────────────────────
  async function push() {
    var cl = getClient(); if (!cl) return;
    notify('pushing', null);
    var ts = new Date().toISOString();
    try {
      var res = await cl.from('sync_data').upsert({
        sync_id: getSyncId(), data: collect(), updated_at: ts,
      });
      if (!res.error) {
        _origSet.call(localStorage, SYNC_TS_KEY, ts);
        notify('synced', ts);
      } else {
        notify('error', null);
        console.warn('[TFSync] push error', res.error);
      }
    } catch (e) {
      notify('error', null);
      console.warn('[TFSync] push exception', e);
    }
  }

  // ── Pull Supabase → local ─────────────────────────────────
  async function pull(syncId) {
    var cl = getClient(); if (!cl) return false;
    syncId = syncId || getSyncId();
    try {
      var res = await cl.from('sync_data')
        .select('data, updated_at')
        .eq('sync_id', syncId)
        .maybeSingle();
      if (res.error || !res.data) return false;

      var remoteTs = res.data.updated_at;
      var localTs  = localStorage.getItem(SYNC_TS_KEY) || '0';
      if (localTs >= remoteTs) { notify('uptodate', remoteTs); return false; }

      // Apply remote data
      Object.keys(res.data.data).forEach(function (k) {
        _origSet.call(localStorage, k, res.data.data[k]);
      });
      _origSet.call(localStorage, SYNC_TS_KEY, remoteTs);
      notify('pulled', remoteTs);
      return true;
    } catch (e) {
      console.warn('[TFSync] pull exception', e);
      return false;
    }
  }

  // ── Connect with a key from another device ────────────────
  async function connectKey(newKey) {
    newKey = (newKey || '').trim();
    if (!newKey) return false;
    var ok = await pull(newKey);
    if (ok) {
      _origSet.call(localStorage, SYNC_ID_KEY, newKey);
      setTimeout(function () { window.location.reload(); }, 120);
    }
    return ok;
  }

  // ── Debounced auto-push ───────────────────────────────────
  var _pushTimer = null;
  function schedulePush() {
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(push, 4000);
  }

  // Intercept localStorage writes — patch BEFORE store.js runs
  var _origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    _origSet.call(this, key, value);
    if (this === localStorage && DATA_KEYS.indexOf(key) !== -1) {
      schedulePush();
    }
  };

  // ── Initial pull (once per browser session) ───────────────
  (async function init() {
    if (sessionStorage.getItem('tf_synced_this_session')) return;
    sessionStorage.setItem('tf_synced_this_session', '1');
    var updated = await pull();
    if (updated) {
      setTimeout(function () { window.location.reload(); }, 100);
    }
  })();

  // Auto-pull when tab gets focus (user switches back)
  window.addEventListener('focus', function () { pull(); });

  // ── Public API ────────────────────────────────────────────
  window.TFSync = {
    push        : push,
    pull        : pull,
    connectKey  : connectKey,
    getSyncId   : getSyncId,
    schedulePush: schedulePush,
  };
})();
