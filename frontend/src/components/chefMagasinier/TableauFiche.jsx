import React from "react"

/**
 * TableauFiche
 * ------------------------------------------------------------------
 * Table section of the "Fiche journalière de déchargement".
 *
 * All calculations stay in FicheJournaliere.jsx.
 */

export default function TableauFiche({
  merchandises = [],
  listeShifts = [],
  shifts = {},
  modifierValeur,
  totalJour,
  totalDech,
  resteABord,
  modifiable = true,
}) {
  const getVal = (obj, section, key) =>
    obj &&
    obj[section] &&
    obj[section][key] !== undefined
      ? obj[section][key]
      : 0

  const handleChange = (
    shiftKey,
    section,
    merchKey,
    e
  ) => {
    const value = e.target.value

    if (
      modifiable &&
      typeof modifierValeur === "function"
    ) {
      modifierValeur(
        shiftKey,
        section,
        merchKey,
        value
      )
    }
  }

  const renderSummaryRow = (
    rowData,
    rowClass
  ) => {
    if (!rowData) {
      return null
    }

    return (
      <tr
        className={`tf-row tf-row-summary ${rowClass}`}
      >
        <td
          className="tf-cell tf-cell-shift tf-cell-summary-label"
          colSpan={2}
        >
          {rowData.label}
        </td>

        {merchandises.map((m) => (
          <td
            key={`qte-${m.key}`}
            className="tf-cell tf-cell-value tf-cell-summary-value"
          >
            {getVal(
              rowData,
              "quantite",
              m.key
            )}
          </td>
        ))}

        <td className="tf-cell tf-divider" />

        {merchandises.map((m) => (
          <td
            key={`ton-${m.key}`}
            className="tf-cell tf-cell-value tf-cell-summary-value"
          >
            {getVal(
              rowData,
              "tonnage",
              m.key
            )}
          </td>
        ))}
      </tr>
    )
  }

  return (
    <div className="tf-wrapper">
      <table className="tf-table">
        <thead>
          <tr className="tf-header-row-1">
            <th
              className="tf-th tf-th-shift"
              rowSpan={2}
            >
              SHIFT
            </th>

            <th
              className="tf-th tf-th-equipes tf-th-equipes-divider"
              rowSpan={2}
            >
              NBR EQUIPES
            </th>

            <th
              className="tf-th tf-th-group"
              colSpan={
                merchandises.length
              }
            >
              QUANTITÉ
            </th>

            <th
              className="tf-th tf-divider"
              rowSpan={2}
            ></th>

            <th
              className="tf-th tf-th-group"
              colSpan={
                merchandises.length
              }
            >
              TONNAGE
            </th>
          </tr>

          <tr className="tf-header-row-2">
            {merchandises.map((m) => (
              <th
                key={`h-qte-${m.key}`}
                className="tf-th tf-th-sub"
              >
                {m.label}
              </th>
            ))}

            {merchandises.map((m) => (
              <th
                key={`h-ton-${m.key}`}
                className="tf-th tf-th-sub"
              >
                {m.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {listeShifts.map((shift) => (
            <tr
              key={shift.key}
              className="tf-row"
            >
              <td className="tf-cell tf-cell-shift">
                {shift.icon && (
                  <span className="tf-shift-icon">
                    {shift.icon}
                  </span>
                )}

                <span>
                  {shift.label}
                </span>
              </td>

              <td className="tf-cell tf-cell-equipes tf-cell-equipes-divider">
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="tf-input tf-input-equipes"
                  defaultValue={
                    shift.nbrEquipes === undefined ||
                    shift.nbrEquipes === null
                      ? 0
                      : shift.nbrEquipes
                  }
                  disabled={!modifiable}
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = ""
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      e.target.value = "0"
                    }

                    handleChange(
                      shift.key,
                      "nbrEquipes",
                      null,
                      e
                    )
                  }}
                  onChange={(e) =>
                    handleChange(
                      shift.key,
                      "nbrEquipes",
                      null,
                      e
                    )
                  }
                />
              </td>

              {merchandises.map((m) => {
                const valeur = getVal(
                  shifts[shift.key],
                  "quantite",
                  m.key
                )

                return (
                  <td
                    key={`in-qte-${shift.key}-${m.key}`}
                    className="tf-cell tf-cell-value"
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="tf-input"
                      defaultValue={valeur}
                      disabled={!modifiable}
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = ""
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          e.target.value = "0"
                        }

                        handleChange(
                          shift.key,
                          "quantite",
                          m.key,
                          e
                        )
                      }}
                      onChange={(e) =>
                        handleChange(
                          shift.key,
                          "quantite",
                          m.key,
                          e
                        )
                      }
                    />
                  </td>
                )
              })}

              <td className="tf-cell tf-divider" />

              {merchandises.map((m) => {
                const valeur = getVal(
                  shifts[shift.key],
                  "tonnage",
                  m.key
                )

                return (
                  <td
                    key={`in-ton-${shift.key}-${m.key}`}
                    className="tf-cell tf-cell-value"
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="tf-input"
                      defaultValue={valeur}
                      disabled={!modifiable}
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = ""
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          e.target.value = "0"
                        }

                        handleChange(
                          shift.key,
                          "tonnage",
                          m.key,
                          e
                        )
                      }}
                      onChange={(e) =>
                        handleChange(
                          shift.key,
                          "tonnage",
                          m.key,
                          e
                        )
                      }
                    />
                  </td>
                )
              })}
            </tr>
          ))}

          {renderSummaryRow(
            totalJour,
            "tf-row-total-jour"
          )}

          {renderSummaryRow(
            totalDech,
            "tf-row-total-dech"
          )}

          {renderSummaryRow(
            resteABord,
            "tf-row-reste-a-bord"
          )}
        </tbody>
      </table>

      <style>{`
        .tf-wrapper {
          width: 100%;
          overflow-x: auto;
          font-family: inherit;
          border-radius: 14px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04);
          background: #fff;
        }

        .tf-table {
          border-collapse: collapse;
          width: 100%;
          font-size: 13px;
          background: #fff;
        }

        .tf-th,
        .tf-cell {
          border: 1px solid #edeff2;
          padding: 10px 12px;
          text-align: center;
          white-space: nowrap;
        }

        .tf-th {
          background: linear-gradient(180deg, #1f3548 0%, #172f43 100%);
          font-weight: 700;
          color: #ffffff;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-color: #172f43;
          padding: 12px 12px;
        }

        .tf-th-group {
          font-size: 12.5px;
          letter-spacing: 0.05em;
        }

        .tf-th-sub {
          background: #f5f7fa;
          color: #344054;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0;
          border-color: #e2e5ea;
        }

        .tf-cell-shift {
          text-align: left;
          font-weight: 700;
          color: #172f43;
          display: table-cell;
          white-space: nowrap;
          background: #f8f9fb;
        }

        .tf-shift-icon {
          margin-right: 6px;
        }

        .tf-row:hover .tf-cell-value,
        .tf-row:hover .tf-cell-shift,
        .tf-row:hover .tf-cell-equipes {
          background-color: #f5f9ff;
        }

        .tf-row:nth-child(even) .tf-cell-value {
          background-color: #fbfcfd;
        }

        .tf-cell-equipes {
          color: #475467;
          font-size: 12.5px;
        }

        .tf-cell-equipes-divider {
          border-right: 3px solid #172f43 !important;
        }

        .tf-th-equipes-divider {
          border-right: 3px solid #172f43 !important;
        }

        .tf-cell-summary-label {
          border-right: 3px solid #172f43 !important;
        }

        .tf-cell-value {
          padding: 6px 8px;
        }

        .tf-input {
          width: 100%;
          min-width: 48px;
          max-width: 70px;
          text-align: center;
          border: 1px solid #d0d5dd;
          border-radius: 6px;
          padding: 6px 4px;
          font-size: 13px;
          font-weight: 500;
          color: #101828;
          background: #fff;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .tf-input-equipes {
          max-width: 70px;
          font-weight: 700;
        }

        .tf-input:hover:not(:disabled) {
          border-color: #98a2b3;
        }

        .tf-input:focus {
          outline: none;
          border-color: #172f43;
          box-shadow: 0 0 0 3px rgba(23,47,67,0.12);
        }

        .tf-input:disabled {
          background: #f8f9fa;
          color: #98a2b3;
          border-color: #eaecf0;
          cursor: not-allowed;
        }

        .tf-divider {
          width: 4px;
          min-width: 4px;
          padding: 0;
          background: linear-gradient(180deg, #172f43, #344054);
          border: none;
        }

        .tf-row-summary td {
          font-weight: 700;
          height: 54px;
          padding-top: 14px;
          padding-bottom: 14px;
          vertical-align: middle;
          font-size: 13.5px;
        }

        .tf-cell-summary-label {
          text-align: center;
          vertical-align: middle;
          letter-spacing: 0.03em;
        }

        .tf-cell-summary-sub {
          font-weight: 500;
        }

        .tf-row-total-jour td {
          background: #eafaf0;
          color: #15803d;
          box-shadow: inset 4px 0 0 #16a34a;
        }

        .tf-row-total-jour .tf-divider {
          background: #172f43;
          box-shadow: none;
        }

        .tf-row-total-dech td {
          background: #eaf3fc;
          color: #1d4ed8;
          box-shadow: inset 4px 0 0 #2563eb;
        }

        .tf-row-total-dech .tf-divider {
          background: #172f43;
          box-shadow: none;
        }

        .tf-row-reste-a-bord td {
          background: #fdecec;
          color: #b91c1c;
          box-shadow: inset 4px 0 0 #dc2626;
        }

        .tf-row-reste-a-bord .tf-divider {
          background: #172f43;
          box-shadow: none;
        }
      `}</style>
    </div>
  )
}