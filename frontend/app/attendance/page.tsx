"use client";

import Header from "@/app/components/Header";
import { useEffect, useMemo, useState } from "react";

type Child = {
  id: number;
  name: string;
};

type AttendanceState = "PRESENT" | "ABSENT" | "SICK";

type AttendanceLog = {
  id: number;
  timestamp: string;
  childName: string;
  from: AttendanceState;
  to: AttendanceState;
  userEmail: string;
};

type AttendanceResponse = {
  date: string;
  groupName: string | null;
  children: Child[];
  attendance: Record<string, AttendanceState>;
  logs: AttendanceLog[];
};

type MonthlyRow = {
  childId: number;
  name: string;
  present: number;
  absent: number;
  sick: number;
};

type MonthlyReport = {
  month: string;
  groupName: string | null;
  rows: MonthlyRow[];
};

const WEEKDAYS = [
  "Nedeľa",
  "Pondelok",
  "Utorok",
  "Streda",
  "Štvrtok",
  "Piatok",
  "Sobota",
];
const MONTHS_SK = [
  "Január",
  "Február",
  "Marec",
  "Apríl",
  "Máj",
  "Jún",
  "Júl",
  "August",
  "September",
  "Október",
  "November",
  "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const monthKeyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

function AttendancePageContent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [groupName, setGroupName] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceState>>(
    {}
  );
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const dateKey = keyOf(selectedDate);

  const dayLabel = useMemo(() => {
    const weekday = WEEKDAYS[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const month = MONTHS_SK[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${weekday}, ${day}. ${month} ${year}`;
  }, [selectedDate]);


  const changeDay = (step: number) => {
    setSelectedDate((prev) => {
      let d = new Date(prev);
      do {
        d.setDate(d.getDate() + step);
      } while (d.getDay() === 0 || d.getDay() === 6);
      return d;
    });
    setMonthlyReport(null);
    setReportError(null);
  };

  const stateLabel = (state: AttendanceState) => {
    switch (state) {
      case "PRESENT":
        return "Prítomný";
      case "ABSENT":
        return "Neprítomný";
      case "SICK":
        return "Chorý";
    }
  };

  const stateClass = (state: AttendanceState) => {
    switch (state) {
      case "PRESENT":
        return "is-all";
      case "ABSENT":
        return "is-none";
      case "SICK":
        return "is-some";
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/attendance?date=${encodeURIComponent(dateKey)}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Response not ok");

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || "Nepodarilo sa načítať dochádzku.");
        }

        const data: AttendanceResponse = json.data;

        if (cancelled) return;

        setGroupName(data.groupName ?? null);
        setChildren(data.children ?? []);
        setAttendance(data.attendance ?? {});
        setLogs(data.logs ?? []);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Nepodarilo sa načítať dochádzku.");
          setGroupName(null);
          setChildren([]);
          setAttendance({});
          setLogs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  const toggleStatus = async (childId: number) => {
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: dateKey, childId }),
      });
      if (!res.ok) throw new Error("Response not ok");

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Nepodarilo sa uložiť dochádzku.");
      }

      const { attendance: att, log } = json.data as {
        attendance: { childId: number; state: AttendanceState };
        log: AttendanceLog;
      };

      setAttendance((prev) => ({
        ...prev,
        [String(att.childId)]: att.state,
      }));
      setLogs((prev) => [log, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const createMonthlyReport = async () => {
    setReportLoading(true);
    setReportError(null);

    const monthKey = monthKeyOf(selectedDate);

    try {
      const resJson = await fetch(
        `${API_BASE}/attendance/report?month=${encodeURIComponent(monthKey)}`,
        { credentials: "include" }
      );
      if (!resJson.ok) throw new Error("JSON response not ok");

      const json = await resJson.json();
      if (!json.success) {
        throw new Error(json.error || "Nepodarilo sa načítať prehľad.");
      }

      const data = json.data as MonthlyReport;
      setMonthlyReport(data);

      const resPdf = await fetch(
        `${API_BASE}/attendance/report/pdf?month=${encodeURIComponent(
          monthKey
        )}`,
        { credentials: "include" }
      );
      if (!resPdf.ok) throw new Error("PDF response not ok");

      const blob = await resPdf.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dochadzka_${monthKey}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setReportError("Nepodarilo sa vytvoriť mesačný prehľad.");
      setMonthlyReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const logsForCurrentDay = logs;

  return (
    <div className="attendance">
      <h1 className="govuk-heading-xl">Denná dochádzka</h1>
      {groupName && (
        <p className="govuk-heading-m govuk-!-margin-bottom-4">
          Trieda: {groupName}
        </p>
      )}

      <div className="topbar">
        <div className="month-nav">
          <button
            type="button"
            className="govuk-button govuk-button--secondary btn-icon"
            onClick={() => changeDay(-1)}
            aria-label="Predchádzajúci deň"
          >
            ‹
          </button>
          <strong className="month-label">{dayLabel}</strong>
          <button
            type="button"
            className="govuk-button govuk-button--secondary btn-icon"
            onClick={() => changeDay(1)}
            aria-label="Ďalší deň"
          >
            ›
          </button>
        </div>

        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={createMonthlyReport}
          disabled={reportLoading || !children.length}
        >
          {reportLoading ? "Vytváram prehľad…" : "Vytvoriť prehľad"}
        </button>
      </div>

      {error && (
        <p className="govuk-error-message govuk-!-margin-top-2">
          <span className="govuk-visually-hidden">Chyba: </span>
          {error}
        </p>
      )}

      {loading && (
        <p className="govuk-body govuk-!-margin-top-2">Načítavam dochádzku…</p>
      )}

      {!loading && children.length === 0 && !error && (
        <p className="govuk-body govuk-!-margin-top-2">
          Nemáte priradenú žiadnu triedu alebo deti.
        </p>
      )}

      <div className="calendar-grid">
        {children.map((child) => {
          const key = String(child.id);
          const state: AttendanceState = attendance[key] ?? "PRESENT";
          const classes = ["day-card", stateClass(state)]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={child.id}
              type="button"
              className={classes}
              onClick={() => toggleStatus(child.id)}
            >
              <div className="day-number">{child.name}</div>
              <div className="day-status">{stateLabel(state)}</div>
              <div className="govuk-hint" style={{ marginTop: "0.35rem" }}>
                Kliknutím zmeniť stav
              </div>
            </button>
          );
        })}
      </div>

      <section className="govuk-!-margin-top-6">
        <h2 className="govuk-heading-m">História zmien ({dateKey})</h2>

        {logsForCurrentDay.length === 0 ? (
          <p className="govuk-body">
            Zatiaľ neboli vykonané žiadne zmeny pre tento deň.
          </p>
        ) : (
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  Čas zmeny
                </th>
                <th scope="col" className="govuk-table__header">
                  Dieťa
                </th>
                <th scope="col" className="govuk-table__header">
                  Zmena
                </th>
                <th scope="col" className="govuk-table__header">
                  Používateľ
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {logsForCurrentDay.map((log) => (
                <tr key={log.id} className="govuk-table__row">
                  <td className="govuk-table__cell">
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="govuk-table__cell">{log.childName}</td>
                  <td className="govuk-table__cell">
                    {stateLabel(log.from)} → {stateLabel(log.to)}
                  </td>
                  <td className="govuk-table__cell">{log.userEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <>
      <Header />
      <main className="govuk-main-wrapper govuk-width-container">
        <AttendancePageContent />
      </main>
    </>
  );
}
