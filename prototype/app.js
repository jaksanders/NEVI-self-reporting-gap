(function () {
  "use strict";

  var STATE_NAMES = {
    AZ: "Arizona", CA: "California", CO: "Colorado", DE: "Delaware",
    GA: "Georgia", HI: "Hawaii", KS: "Kansas", KY: "Kentucky",
    MD: "Maryland", ME: "Maine", MI: "Michigan", MN: "Minnesota",
    NM: "New Mexico", NY: "New York", OH: "Ohio", PA: "Pennsylvania",
    RI: "Rhode Island", TX: "Texas", UT: "Utah", VA: "Virginia",
    WI: "Wisconsin"
  };

  var CONFIDENCE_BADGE = {
    text_confirmed: "†",
    chart_confirmed: "",
    chart_confirmed_inferred_position: "*"
  };

  var CONFIDENCE_TITLE = {
    text_confirmed: "Text-confirmed: exact figure stated in the report's prose.",
    chart_confirmed: "Chart-confirmed: read directly from an inline label on Paren's reliability map.",
    chart_confirmed_inferred_position: "Inferred position: this state is too small for an inline label; the figure was obtained by tracing its callout line back to its shape on the map."
  };

  var METER_MIN = 70;   // meter window floor — all observed rates sit above this
  var METER_MAX = 100;
  var NEVI_REQUIREMENT = 97.0;

  var state = {
    rows: [],
    sortKey: "state",
    sortDir: "asc",
    openState: null
  };

  function meterPct(value) {
    var clamped = Math.max(METER_MIN, Math.min(METER_MAX, value));
    return ((clamped - METER_MIN) / (METER_MAX - METER_MIN)) * 100;
  }

  function buildRow(row) {
    var tr = document.createElement("tr");
    tr.className = "data-row";
    tr.dataset.state = row.state;
    tr.tabIndex = 0;

    var tdState = document.createElement("td");
    tdState.className = "state-cell";
    tdState.textContent = row.state + " — " + (STATE_NAMES[row.state] || row.state);
    tr.appendChild(tdState);

    var tdCount = document.createElement("td");
    tdCount.className = "align-num";
    tdCount.textContent = String(row.nevi_station_count);
    tr.appendChild(tdCount);

    var tdReq = document.createElement("td");
    tdReq.className = "align-num";
    tdReq.textContent = row.nevi_required_uptime_pct.toFixed(0) + "%";
    tr.appendChild(tdReq);

    var tdRate = document.createElement("td");
    var cell = document.createElement("div");
    cell.className = "meter-cell";

    var track = document.createElement("div");
    track.className = "meter-track";

    var fill = document.createElement("div");
    fill.className = "meter-fill";
    fill.style.width = meterPct(row.paren_reliability_rate) + "%";
    track.appendChild(fill);

    var marker = document.createElement("div");
    marker.className = "meter-marker";
    marker.style.left = meterPct(NEVI_REQUIREMENT) + "%";
    marker.title = "NEVI requirement: 97%";
    track.appendChild(marker);

    cell.appendChild(track);

    var valueSpan = document.createElement("span");
    valueSpan.className = "meter-value";
    var badge = CONFIDENCE_BADGE[row.paren_confidence] || "";
    valueSpan.textContent = row.paren_reliability_rate.toFixed(1) + (badge ? " " : "");
    if (badge) {
      var badgeEl = document.createElement("span");
      badgeEl.className = "badge";
      badgeEl.textContent = badge;
      badgeEl.title = CONFIDENCE_TITLE[row.paren_confidence] || "";
      valueSpan.appendChild(badgeEl);
    }
    cell.appendChild(valueSpan);

    tdRate.appendChild(cell);
    tr.appendChild(tdRate);

    tr.addEventListener("click", function () { toggleDetail(row.state); });
    tr.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDetail(row.state);
      }
    });

    return tr;
  }

  function buildDetailRow(row) {
    var tr = document.createElement("tr");
    tr.className = "detail-row";
    tr.hidden = true;
    tr.dataset.detailFor = row.state;

    var td = document.createElement("td");
    td.colSpan = 4;

    var gap = (NEVI_REQUIREMENT - row.paren_reliability_rate).toFixed(1);
    var confidenceText = CONFIDENCE_TITLE[row.paren_confidence] || "";

    var name = STATE_NAMES[row.state] || row.state;
    var sentence = document.createElement("p");
    sentence.style.margin = "0 0 6px";
    sentence.textContent =
      name + " has " + row.nevi_station_count + " NEVI-funded station" +
      (row.nevi_station_count === 1 ? "" : "s") + ". Self-reported requirement: " +
      row.nevi_required_uptime_pct.toFixed(0) + "%. Paren's Q2 2026 reliability rate: " +
      row.paren_reliability_rate.toFixed(1) + "% — " + gap +
      " points below the flat requirement (directional comparison only; see Methodology).";
    td.appendChild(sentence);

    var conf = document.createElement("p");
    conf.style.margin = "0";
    conf.style.fontStyle = "italic";
    conf.textContent = confidenceText;
    td.appendChild(conf);

    tr.appendChild(td);
    return tr;
  }

  function toggleDetail(stateCode) {
    state.openState = state.openState === stateCode ? null : stateCode;
    render();
  }

  function sortRows(rows) {
    var key = state.sortKey;
    var dir = state.sortDir === "asc" ? 1 : -1;
    return rows.slice().sort(function (a, b) {
      var av = a[key], bv = b[key];
      if (typeof av === "string") { return av.localeCompare(bv) * dir; }
      return (av - bv) * dir;
    });
  }

  function updateSortIndicators() {
    var headers = document.querySelectorAll("th.sortable");
    headers.forEach(function (th) {
      if (th.dataset.sort === state.sortKey) {
        th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      } else {
        th.removeAttribute("aria-sort");
      }
    });
  }

  function render() {
    var tbody = document.getElementById("table-body");
    tbody.textContent = "";
    var sorted = sortRows(state.rows);
    sorted.forEach(function (row) {
      tbody.appendChild(buildRow(row));
      var detail = buildDetailRow(row);
      if (state.openState === row.state) { detail.hidden = false; }
      tbody.appendChild(detail);
    });
    updateSortIndicators();
  }

  function wireSorting() {
    var headers = document.querySelectorAll("th.sortable");
    headers.forEach(function (th) {
      var arrow = document.createElement("span");
      arrow.className = "sort-arrow";
      th.appendChild(arrow);
      th.addEventListener("click", function () {
        var key = th.dataset.sort;
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        render();
      });
    });
  }

  function populateStats(rows) {
    var totalStations = rows.reduce(function (sum, r) { return sum + r.nevi_station_count; }, 0);
    document.getElementById("stat-stations").textContent = totalStations;
    document.getElementById("stat-states").textContent = rows.length;
  }

  function populateSourceLine(meta) {
    var el = document.getElementById("source-line");
    if (!el || !meta) { return; }
    var text = "Source: Paren, US EV Fast Charging Report, Q2 2026 — ";
    el.textContent = text;
    var link = document.createElement("a");
    link.href = meta.source;
    link.textContent = meta.source;
    link.rel = "noopener";
    el.appendChild(link);
    var dateSpan = document.createElement("span");
    dateSpan.textContent = " (published " + meta.source_date + ")";
    el.appendChild(dateSpan);
  }

  Promise.all([
    fetch("data/nevi_paren_comparison.json").then(function (r) { return r.json(); }),
    fetch("data/paren_state_reliability_q2_2026.json").then(function (r) { return r.json(); })
  ]).then(function (results) {
    var comparison = results[0];
    var parenMeta = results[1]._meta;

    state.rows = comparison.states;
    populateStats(state.rows);
    populateSourceLine(parenMeta);
    wireSorting();
    render();
  }).catch(function (err) {
    var tbody = document.getElementById("table-body");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Could not load data: " + err.message;
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
})();
