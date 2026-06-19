// T-Finance · Supabase Cloud Sync
(function () {
  'use strict';

  var SUPABASE_URL  = 'https://vimxepexjtstnfugbptx.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXhlcGV4anRzdG5mdWdicHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODE5MjMsImV4cCI6MjA5NzQ1NzkyM30.EzCoKGn55Dxi44dGra5uBcn8o3zzDl14u0rXK0m-j9U';

  var FIXED_SYNC_ID = 'fc73dc94-f8f1-44ae-b551-01a2ca3b1e4f';
  var SYNC_TS_KEY = 'tf_sync_ts';
  var DATA_KEYS   = [
    'tf_user', 'tf_accounts', 'tf_transactions', 'tf_goals',
    'tf_seeded_v1', 'tf_adv', 'tf_theme', 'tf_mig_uzs',
    'tf_an_tab', 'tf_adv_tab', 'tf_route',
  ];

  function log()  { console.log.apply(console, ['[TFSync]'].concat([].slice.call(arguments))); }
  function warn() { console.warn.apply(console, ['[TFSync]'].concat([].slice.call(arguments))); }

  log('loaded · sync_id =', FIXED_SYNC_ID);

  // keep a clean reference to setItem so our own writes don't trigger a push loop
  var _origSet = Storage.prototype.setItem;

  function collect() {
    var d = {};
    DATA_KEYS.forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v != null) d[k] = v;
    });
    return d;
  }

  function notify(status, ts) {
    window.dispatchEvent(new CustomEvent('tf_sync', { detail: { status: status, ts: ts || null } }));
  }

  // ── REST helpers (no supabase-js dependency) ──────────────
  function headers(extra) {
    var h = {
      'apikey': SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Content-Type': 'application/json',
    };
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  // ── Push local → Supabase ─────────────────────────────────
  async function push() {
    notify('pushing', null);
    var ts = new Date().toISOString();
    try {
      var res = await fetch(SUPABASE_URL + '/rest/v1/sync_data', {
        method: 'POST',
        headers: headers({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify({ sync_id: FIXED_SYNC_ID, data: collect(), updated_at: ts }),
      });
      if (res.ok) {
        _origSet.call(localStorage, SYNC_TS_KEY, ts);
        notify('synced', ts);
        log('✓ pushed at', ts);
      } else {
        var txt = await res.text();
        notify('error', null);
        warn('push failed', res.status, txt);
      }
    } catch (e) {
      notify('error', null);
      warn('push exception', e);
    }
  }

  // ── Pull Supabase → local ─────────────────────────────────
  async function pull() {
    try {
      var res = await fetch(
        SUPABASE_URL + '/rest/v1/sync_data?sync_id=eq.' + FIXED_SYNC_ID + '&select=data,updated_at',
        { headers: headers() }
      );
      if (!res.ok) { warn('pull failed', res.status); return false; }
      var rows = await res.json();
      if (!rows.length) { log('cloud is empty'); return false; }

      var remoteTs = rows[0].updated_at;
      var localTs  = localStorage.getItem(SYNC_TS_KEY) || '0';
      var remoteMs = new Date(remoteTs).getTime();
      var localMs  = localTs === '0' ? 0 : new Date(localTs).getTime();
      log('compare · local:', localTs, '(' + localMs + ') · remote:', remoteTs, '(' + remoteMs + ')');
      if (localMs >= remoteMs) { log('local is up to date'); notify('uptodate', remoteTs); return false; }

      Object.keys(rows[0].data).forEach(function (k) {
        _origSet.call(localStorage, k, rows[0].data[k]);
      });
      _origSet.call(localStorage, SYNC_TS_KEY, remoteTs);
      notify('pulled', remoteTs);
      log('✓ pulled newer data from cloud');
      return true;
    } catch (e) {
      warn('pull exception', e);
      return false;
    }
  }

  // ── Debounced auto-push ───────────────────────────────────
  var _pushTimer = null;
  function schedulePush() {
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(push, 1500);
  }

  // Intercept localStorage writes — patch BEFORE store.js runs
  Storage.prototype.setItem = function (key, value) {
    _origSet.call(this, key, value);
    if (this === localStorage && DATA_KEYS.indexOf(key) !== -1) {
      schedulePush();
    }
  };

  // ── Initial pull on every load ────────────────────────────
  (async function init() {
    var updated = await pull();
    if (updated) {
      log('reloading to apply cloud data…');
      setTimeout(function () { window.location.reload(); }, 100);
    }
  })();

  // Auto-pull when tab gets focus (user switches back)
  window.addEventListener('focus', async function () {
    var updated = await pull();
    if (updated) setTimeout(function () { window.location.reload(); }, 100);
  });

  // ── Public API ────────────────────────────────────────────
  window.TFSync = {
    push: push,
    pull: pull,
    getSyncId: function () { return FIXED_SYNC_ID; },
    schedulePush: schedulePush,
  };
})();
