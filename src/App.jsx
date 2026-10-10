import { useEffect, useMemo, useState } from "react";
import "./App.css";

const DEFAULT_REQUESTS = "98,183,37,122,14,124,65,67";

function parseRequests(text, size) {
  return text
    .split(",")
    .map((x) => Number(x.trim()))
    .filter(
      (x) =>
        Number.isInteger(x) &&
        x >= 0 &&
        x < size
    );
}

function movement(path) {
  let total = 0;

  for (let i = 1; i < path.length; i++) {
    total += Math.abs(path[i] - path[i - 1]);
  }

  return total;
}

function fcfs(head, requests) {
  return [head, ...requests];
}

function sstf(head, requests) {
  const pending = [...requests];
  const result = [head];
  let current = head;

  while (pending.length) {
    let index = 0;

    for (let i = 1; i < pending.length; i++) {
      if (
        Math.abs(current - pending[i]) <
        Math.abs(current - pending[index])
      ) {
        index = i;
      }
    }

    current = pending[index];
    result.push(current);
    pending.splice(index, 1);
  }

  return result;
}

function scan(head, requests, size, direction) {
  const left = requests
    .filter((x) => x < head)
    .sort((a, b) => b - a);

  const right = requests
    .filter((x) => x >= head)
    .sort((a, b) => a - b);

  if (direction === "right") {
    return [
      head,
      ...right,
      size - 1,
      ...left,
      0,
    ].filter(
      (x, i, a) =>
        i === 0 || x !== a[i - 1]
    );
  }

  return [
    head,
    ...left,
    0,
    ...right,
    size - 1,
  ].filter(
    (x, i, a) =>
      i === 0 || x !== a[i - 1]
  );
}

function cscan(head, requests, size, direction) {
  const left = requests
    .filter((x) => x < head)
    .sort((a, b) => b - a);

  const right = requests
    .filter((x) => x >= head)
    .sort((a, b) => a - b);

  if (direction === "right") {
    return [
      head,
      ...right,
      size - 1,
      0,
      ...left,
    ].filter(
      (x, i, a) =>
        i === 0 || x !== a[i - 1]
    );
  }

  return [
    head,
    ...left,
    0,
    size - 1,
    ...right,
  ].filter(
    (x, i, a) =>
      i === 0 || x !== a[i - 1]
  );
}

function look(head, requests, direction) {
  const left = requests
    .filter((x) => x < head)
    .sort((a, b) => b - a);

  const right = requests
    .filter((x) => x >= head)
    .sort((a, b) => a - b);

  return direction === "right"
    ? [head, ...right, ...left]
    : [head, ...left, ...right];
}

function clook(head, requests, direction) {
  const left = requests
    .filter((x) => x < head)
    .sort((a, b) => b - a);

  const right = requests
    .filter((x) => x >= head)
    .sort((a, b) => a - b);

  return direction === "right"
    ? [head, ...right, ...left]
    : [head, ...left, ...right];
}

function runAlgorithm(
  algorithm,
  head,
  requests,
  size,
  direction
) {
  switch (algorithm) {
    case "FCFS":
      return fcfs(head, requests);

    case "SSTF":
      return sstf(head, requests);

    case "SCAN":
      return scan(
        head,
        requests,
        size,
        direction
      );

    case "C-SCAN":
      return cscan(
        head,
        requests,
        size,
        direction
      );

    case "LOOK":
      return look(
        head,
        requests,
        direction
      );

    case "C-LOOK":
      return clook(
        head,
        requests,
        direction
      );

    default:
      return fcfs(head, requests);
  }
}

/* ================= SEEK GRAPH ================= */

function SeekGraph({ sequence, diskSize }) {
  const width = 1000;
  const height = 430;

  const paddingLeft = 70;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 55;

  const graphWidth =
    width - paddingLeft - paddingRight;

  const graphHeight =
    height - paddingTop - paddingBottom;

  const maxSteps =
    Math.max(sequence.length - 1, 1);

  function xPosition(value) {
    return (
      paddingLeft +
      (Number(value) /
        Math.max(1, Number(diskSize) - 1)) *
        graphWidth
    );
  }

  function yPosition(index) {
    return (
      paddingTop +
      (index / maxSteps) *
        graphHeight
    );
  }

  /* Create connected graph path */

  const path = sequence
    .map((value, index) => {
      const x = xPosition(value);
      const y = yPosition(index);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <section className="card seek-graph-card">

      <div className="card-title">

        <div>
          <h3>
            Disk Head Movement Graph
          </h3>

          <p>
            Cylinder position versus service
            sequence
          </p>
        </div>

        <span className="graph-badge">
          {sequence.length - 1} movements
        </span>

      </div>


      <div className="seek-graph-wrapper">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="seek-graph"
        >

          {/* ================= GRID ================= */}

          {/* Horizontal grid lines */}

          {Array.from({
            length: sequence.length,
          }).map((_, index) => {

            const y =
              yPosition(index);

            return (
              <line
                key={`h-${index}`}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                className="graph-grid"
              />
            );
          })}


          {/* Vertical grid lines */}

          {Array.from({
            length: 11,
          }).map((_, index) => {

            const value =
              Math.round(
                ((Number(diskSize) - 1) /
                  10) *
                  index
              );

            const x =
              xPosition(value);

            return (
              <line
                key={`v-${index}`}
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={
                  height -
                  paddingBottom
                }
                className="graph-grid"
              />
            );
          })}


          {/* ================= AXES ================= */}

          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={
              height -
              paddingBottom
            }
            className="graph-axis"
          />

          <line
            x1={paddingLeft}
            y1={
              height -
              paddingBottom
            }
            x2={
              width -
              paddingRight
            }
            y2={
              height -
              paddingBottom
            }
            className="graph-axis"
          />


          {/* ================= GRAPH PATH ================= */}

          <path
            d={path}
            className="seek-path"
          />


          {/* ================= MOVEMENT SEGMENTS ================= */}

          {sequence.map(
            (value, index) => {

              if (index === 0) {
                return null;
              }

              const previous =
                sequence[index - 1];

              const x1 =
                xPosition(previous);

              const y1 =
                yPosition(index - 1);

              const x2 =
                xPosition(value);

              const y2 =
                yPosition(index);

              return (
                <line
                  key={`movement-${index}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={
                    index <=
                    0
                      ? "movement-line"
                      : "movement-line"
                  }
                />
              );
            }
          )}


          {/* ================= POINTS ================= */}

          {sequence.map(
            (value, index) => {

              const x =
                xPosition(value);

              const y =
                yPosition(index);

              return (
                <g
                  key={`point-${index}`}
                >

                  {/* Outer circle */}

                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    className="graph-point"
                  />

                  {/* Inner circle */}

                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    className="graph-point-core"
                  />


                  {/* Cylinder value */}

                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className="graph-value"
                  >
                    {value}
                  </text>


                  {/* Step number */}

                  <text
                    x={
                      paddingLeft -
                      12
                    }
                    y={y + 4}
                    textAnchor="end"
                    className="graph-step"
                  >
                    {index}
                  </text>

                </g>
              );
            }
          )}


          {/* ================= X AXIS LABELS ================= */}

          {Array.from({
            length: 11,
          }).map((_, index) => {

            const value =
              Math.round(
                ((Number(diskSize) - 1) /
                  10) *
                  index
              );

            const x =
              xPosition(value);

            return (
              <text
                key={`label-${index}`}
                x={x}
                y={
                  height -
                  paddingBottom +
                  25
                }
                textAnchor="middle"
                className="graph-axis-label"
              >
                {value}
              </text>
            );
          })}


          {/* ================= AXIS TITLES ================= */}

          <text
            x={
              width / 2
            }
            y={
              height - 10
            }
            textAnchor="middle"
            className="graph-title"
          >
            Cylinder Number
          </text>


          <text
            x="18"
            y={
              height / 2
            }
            textAnchor="middle"
            transform={`rotate(-90 18 ${
              height / 2
            })`}
            className="graph-title"
          >
            Request Sequence
          </text>

        </svg>

      </div>


      {/* ================= SEQUENCE ================= */}

      <div className="graph-sequence">

        <span className="sequence-label">
          Service Order:
        </span>

        {sequence.map(
          (value, index) => (
            <div
              className="sequence-item"
              key={`${value}-${index}`}
            >

              <span>
                {value}
              </span>

              {index <
                sequence.length - 1 && (
                <b>→</b>
              )}

            </div>
          )
        )}

      </div>

    </section>
  );
}


function App() {
  const [diskSize, setDiskSize] =
    useState(200);

  const [headPosition, setHeadPosition] =
    useState(50);

  const [requestText, setRequestText] =
    useState(DEFAULT_REQUESTS);

  const [algorithm, setAlgorithm] =
    useState("FCFS");

  const [direction, setDirection] =
    useState("right");

  const [sequence, setSequence] =
    useState([50]);

  const [currentStep, setCurrentStep] =
    useState(0);

  const [isRunning, setIsRunning] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("Ready to simulate");

  const [comparison, setComparison] =
    useState(null);

  const requests = useMemo(
    () =>
      parseRequests(
        requestText,
        Number(diskSize)
      ),
    [requestText, diskSize]
  );

  const currentPosition =
    sequence[currentStep] ??
    Number(headPosition);

  const previousPosition =
    currentStep > 0
      ? sequence[currentStep - 1]
      : currentPosition;

  const totalMovement = movement(
    sequence.slice(
      0,
      currentStep + 1
    )
  );

  const completed =
    Math.max(0, currentStep);

  const averageSeek =
    completed > 0
      ? (
          totalMovement / completed
        ).toFixed(2)
      : "0.00";

  const movementDirection =
    currentPosition >
    previousPosition
      ? "→ Moving Outward"
      : currentPosition <
        previousPosition
      ? "← Moving Inward"
      : "● Stationary";

  /* ================= ANIMATION ================= */

  useEffect(() => {
    if (
      !isRunning ||
      isPaused
    ) {
      return;
    }

    if (
      currentStep >=
      sequence.length - 1
    ) {
      setIsRunning(false);
      setMessage(
        "Simulation completed"
      );
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(
        (value) => value + 1
      );
    }, 700);

    return () =>
      clearTimeout(timer);
  }, [
    isRunning,
    isPaused,
    currentStep,
    sequence,
  ]);

  /* ================= RUN ================= */

  function handleRun() {
    const size = Number(diskSize);
    const head = Number(headPosition);

    if (
      !Number.isInteger(size) ||
      size < 20
    ) {
      setError(
        "Disk size must be at least 20."
      );
      return;
    }

    if (
      !Number.isInteger(head) ||
      head < 0 ||
      head >= size
    ) {
      setError(
        `Head must be between 0 and ${
          size - 1
        }.`
      );
      return;
    }

    if (!requests.length) {
      setError(
        "Enter at least one valid request."
      );
      return;
    }

    const result =
      runAlgorithm(
        algorithm,
        head,
        requests,
        size,
        direction
      );

    setSequence(result);
    setCurrentStep(0);
    setIsRunning(true);
    setIsPaused(false);
    setComparison(null);
    setError("");
    setMessage(
      `${algorithm} simulation running...`
    );
  }

  /* ================= PAUSE ================= */

  function togglePause() {
    setIsPaused(
      (value) => !value
    );

    setMessage(
      isPaused
        ? "Simulation resumed"
        : "Simulation paused"
    );
  }

  /* ================= RESTART ================= */

  function restart() {
    if (!sequence.length) return;

    setCurrentStep(0);
    setIsPaused(false);
    setIsRunning(true);
    setMessage(
      "Simulation restarted"
    );
  }

  /* ================= RESET ================= */

  function reset() {
    setDiskSize(200);
    setHeadPosition(50);
    setRequestText(
      DEFAULT_REQUESTS
    );
    setAlgorithm("FCFS");
    setDirection("right");
    setSequence([50]);
    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);
    setComparison(null);
    setError("");
    setMessage(
      "Ready to simulate"
    );
  }

  /* ================= RANDOM ================= */

  function randomRequests() {
    const size = Number(diskSize);

    const values = [];

    for (let i = 0; i < 8; i++) {
      values.push(
        Math.floor(
          Math.random() * size
        )
      );
    }

    setRequestText(
      values.join(",")
    );
  }

  /* ================= COMPARE ================= */

  function compareAlgorithms() {
    const size = Number(diskSize);
    const head = Number(headPosition);

    if (!requests.length) {
      setError(
        "Enter valid requests first."
      );
      return;
    }

    const names = [
      "FCFS",
      "SSTF",
      "SCAN",
      "C-SCAN",
      "LOOK",
      "C-LOOK",
    ];

    const result =
      names.map((name) => {
        const path =
          runAlgorithm(
            name,
            head,
            requests,
            size,
            direction
          );

        const total =
          movement(path);

        return {
          name,
          total,
          average: (
            total /
            requests.length
          ).toFixed(2),
        };
      });

    setComparison(result);
    setError("");
  }

  /* ================= DISK ================= */

  const center = 220;
  const tracks = 12;

  function trackRadius(index) {
    return 40 + index * 13;
  }

  function positionToRadius(position) {
    const size =
      Number(diskSize) || 200;

    return (
      40 +
      (position /
        Math.max(1, size - 1)) *
        156
    );
  }

  const headRadius =
    positionToRadius(
      currentPosition
    );

  const angle = -35;

  const rad =
    (angle * Math.PI) / 180;

  const headX =
    center +
    headRadius *
      Math.cos(rad);

  const headY =
    center +
    headRadius *
      Math.sin(rad);

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            DS
          </div>

          <div>
            <h1>
              Disk Scheduling Simulator
            </h1>

            <p>
              Operating System • Disk I/O
              Visualization
            </p>
          </div>

        </div>

        <div className="status">
          <span />
          {isRunning
            ? isPaused
              ? "Paused"
              : "Simulation Running"
            : "System Ready"}
        </div>

      </header>


      <div className="layout">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="sidebar-title">
            <h2>
              Simulation Setup
            </h2>

            <p>
              Configure disk parameters
            </p>
          </div>


          <div className="input-group">

            <label>
              Disk Size
            </label>

            <input
              type="number"
              min="20"
              max="500"
              value={diskSize}
              onChange={(e) =>
                setDiskSize(
                  Number(e.target.value)
                )
              }
            />

            <small>
              Cylinders: 0 –{" "}
              {Number(diskSize) - 1}
            </small>

          </div>


          <div className="input-group">

            <label>
              Initial Head Position
            </label>

            <input
              type="number"
              min="0"
              max={
                Number(diskSize) - 1
              }
              value={headPosition}
              onChange={(e) =>
                setHeadPosition(
                  Number(e.target.value)
                )
              }
            />

          </div>


          <div className="input-group">

            <div className="label-row">

              <label>
                Disk Requests
              </label>

              <button
                className="random-btn"
                onClick={
                  randomRequests
                }
              >
                Random
              </button>

            </div>

            <textarea
              rows="4"
              value={requestText}
              onChange={(e) =>
                setRequestText(
                  e.target.value
                )
              }
            />

            <small>
              Example:
              98,183,37,122,14,124,65,67
            </small>

          </div>


          <div className="input-group">

            <label>
              Scheduling Algorithm
            </label>

            <select
              value={algorithm}
              onChange={(e) =>
                setAlgorithm(
                  e.target.value
                )
              }
            >
              <option>FCFS</option>
              <option>SSTF</option>
              <option>SCAN</option>
              <option>C-SCAN</option>
              <option>LOOK</option>
              <option>C-LOOK</option>
            </select>

          </div>


          {(algorithm === "SCAN" ||
            algorithm === "C-SCAN" ||
            algorithm === "LOOK" ||
            algorithm === "C-LOOK") && (
            <div className="input-group">

              <label>
                Initial Direction
              </label>

              <div className="direction-buttons">

                <button
                  className={
                    direction === "left"
                      ? "direction active"
                      : "direction"
                  }
                  onClick={() =>
                    setDirection("left")
                  }
                >
                  ← Left
                </button>

                <button
                  className={
                    direction === "right"
                      ? "direction active"
                      : "direction"
                  }
                  onClick={() =>
                    setDirection("right")
                  }
                >
                  Right →
                </button>

              </div>

            </div>
          )}


          <button
            className="run-btn"
            onClick={handleRun}
            disabled={isRunning}
          >
            ▶ Run Simulation
          </button>


          <div className="control-row">

            <button
              className="pause-btn"
              onClick={
                togglePause
              }
              disabled={!isRunning}
            >
              {isPaused
                ? "▶ Resume"
                : "Ⅱ Pause"}
            </button>

            <button
              className="restart-btn"
              onClick={restart}
              disabled={
                sequence.length <= 1
              }
            >
              ↻ Restart
            </button>

          </div>


          <button
            className="compare-btn"
            onClick={
              compareAlgorithms
            }
          >
            ⇄ Compare Algorithms
          </button>


          <button
            className="reset-btn"
            onClick={reset}
          >
            Reset Project
          </button>


          {error && (
            <div className="error">
              ⚠ {error}
            </div>
          )}

        </aside>


        {/* MAIN */}

        <main className="main">

          <div className="page-title">

            <div>
              <h2>
                Disk Structure Visualization
              </h2>

              <p>
                Platter • Tracks • Sectors •
                Actuator • Read/Write Head
              </p>
            </div>

            <div className="algorithm-badge">
              {algorithm}
            </div>

          </div>


          {/* DISK */}

          <section className="disk-card">

            <div className="disk-card-header">

              <div>
                <h3>
                  Physical Disk
                </h3>

                <span>
                  Current Cylinder:{" "}
                  <strong>
                    {currentPosition}
                  </strong>
                </span>
              </div>

              <div className="disk-status">

                <span>
                  {message}
                </span>

                <strong>
                  {movementDirection}
                </strong>

              </div>

            </div>


            <div className="disk-visual">

              <svg
                viewBox="0 0 440 440"
                className={
                  isRunning &&
                  !isPaused
                    ? "disk-svg disk-spinning"
                    : "disk-svg"
                }
              >

                {/* ROTATING PLATTER */}

                <g className="rotating-platter">

                  <circle
                    cx={center}
                    cy={center}
                    r="200"
                    className="platter"
                  />

                  {/* TRACKS */}

                  {Array.from({
                    length: tracks,
                  }).map(
                    (_, index) => (
                      <circle
                        key={index}
                        cx={center}
                        cy={center}
                        r={trackRadius(
                          index
                        )}
                        className={
                          Math.abs(
                            trackRadius(
                              index
                            ) -
                              headRadius
                          ) < 7
                            ? "track active-track"
                            : "track"
                        }
                      />
                    )
                  )}

                  {/* SECTORS */}

                  {Array.from({
                    length: 16,
                  }).map(
                    (_, index) => {

                      const a =
                        (index * 360) /
                        16;

                      const r =
                        (a * Math.PI) /
                        180;

                      return (
                        <line
                          key={index}
                          x1={
                            center +
                            35 *
                              Math.cos(
                                r
                              )
                          }
                          y1={
                            center +
                            35 *
                              Math.sin(
                                r
                              )
                          }
                          x2={
                            center +
                            200 *
                              Math.cos(
                                r
                              )
                          }
                          y2={
                            center +
                            200 *
                              Math.sin(
                                r
                              )
                          }
                          className="sector-line"
                        />
                      );
                    }
                  )}

                  {/* REQUEST MARKERS */}

                  {requests.map(
                    (
                      request,
                      index
                    ) => {

                      const radius =
                        positionToRadius(
                          request
                        );

                      const a =
                        -90 +
                        (index % 8) *
                          45;

                      const r =
                        (a * Math.PI) /
                        180;

                      const x =
                        center +
                        radius *
                          Math.cos(r);

                      const y =
                        center +
                        radius *
                          Math.sin(r);

                      const active =
                        request ===
                        currentPosition;

                      return (
                        <g
                          key={`${request}-${index}`}
                        >

                          <circle
                            cx={x}
                            cy={y}
                            r={
                              active
                                ? 7
                                : 5
                            }
                            className={
                              active
                                ? "request-marker current-request"
                                : "request-marker"
                            }
                          />

                          {active && (
                            <circle
                              cx={x}
                              cy={y}
                              r="12"
                              className="request-pulse"
                            />
                          )}

                        </g>
                      );
                    }
                  )}

                </g>


                {/* SPINDLE */}

                <circle
                  cx={center}
                  cy={center}
                  r="27"
                  className="spindle"
                />

                <circle
                  cx={center}
                  cy={center}
                  r="9"
                  className="spindle-hole"
                />


                {/* ARM */}

                <line
                  x1={center}
                  y1={center}
                  x2={headX}
                  y2={headY}
                  className="actuator"
                />


                {/* HEAD */}

                <circle
                  cx={headX}
                  cy={headY}
                  r="11"
                  className="read-head"
                />

                <circle
                  cx={headX}
                  cy={headY}
                  r="4"
                  className="head-core"
                />

              </svg>


              <div className="disk-legend">

                <div>
                  <span className="legend-dot track-dot" />
                  Track
                </div>

                <div>
                  <span className="legend-dot request-dot" />
                  Request
                </div>

                <div>
                  <span className="legend-dot head-dot" />
                  Read/Write Head
                </div>

                <div>
                  <span className="legend-dot arm-dot" />
                  Actuator Arm
                </div>

              </div>

            </div>


            <div className="scale">

              <span>0</span>

              <span>
                {Math.round(
                  diskSize * 0.25
                )}
              </span>

              <span>
                {Math.round(
                  diskSize * 0.5
                )}
              </span>

              <span>
                {Math.round(
                  diskSize * 0.75
                )}
              </span>

              <span>
                {diskSize - 1}
              </span>

            </div>

          </section>


          {/* STATISTICS */}

          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon">
                ↔
              </div>

              <div>
                <p>
                  Total Head Movement
                </p>

                <h3>
                  {totalMovement}
                </h3>

                <small>
                  cylinders
                </small>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon">
                ◉
              </div>

              <div>
                <p>
                  Average Seek
                </p>

                <h3>
                  {averageSeek}
                </h3>

                <small>
                  cylinders
                </small>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon">
                ✓
              </div>

              <div>
                <p>
                  Requests
                </p>

                <h3>
                  {requests.length}
                </h3>

                <small>
                  total
                </small>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon">
                ●
              </div>

              <div>
                <p>
                  Current Head
                </p>

                <h3>
                  {currentPosition}
                </h3>

                <small>
                  cylinder
                </small>
              </div>
            </div>

          </div>


          {/* MOVEMENT */}

          <section className="card">

            <div className="card-title">

              <div>
                <h3>
                  Head Movement
                </h3>

                <p>
                  Current scheduling sequence
                </p>
              </div>

              <span className="step-counter">
                Step {currentStep} /{" "}
                {sequence.length - 1}
              </span>

            </div>


            <div className="movement">

              {sequence.map(
                (value, index) => (
                  <div
                    className="movement-group"
                    key={`${value}-${index}`}
                  >

                    <div
                      className={
                        index ===
                        currentStep
                          ? "movement-number active"
                          : index <
                            currentStep
                          ? "movement-number completed"
                          : "movement-number"
                      }
                    >
                      {value}
                    </div>

                    {index <
                      sequence.length -
                        1 && (
                      <span>
                        →
                      </span>
                    )}

                  </div>
                )
              )}

            </div>

          </section>

          {/* ================= SEEK GRAPH ================= */}

<SeekGraph
  sequence={sequence}
  diskSize={Number(diskSize)}
/>


          {/* REQUEST QUEUE */}

          <section className="card">

            <div className="card-title">
              <div>
                <h3>
                  Request Queue
                </h3>

                <p>
                  {requests.length} disk
                  requests
                </p>
              </div>
            </div>

            <div className="request-list">

              {requests.map(
                (
                  request,
                  index
                ) => (
                  <div
                    className={
                      request ===
                      currentPosition
                        ? "request-chip active"
                        : "request-chip"
                    }
                    key={`${request}-${index}`}
                  >
                    {request}
                  </div>
                )
              )}

            </div>

          </section>


          {/* COMPARISON */}

          {comparison && (
            <section className="card">

              <div className="card-title">
                <div>
                  <h3>
                    Algorithm Comparison
                  </h3>

                  <p>
                    Total head movement
                  </p>
                </div>
              </div>

              <div className="comparison">

                {comparison.map(
                  (item) => {

                    const max =
                      Math.max(
                        ...comparison.map(
                          (x) =>
                            x.total
                        )
                      );

                    const width =
                      max > 0
                        ? (item.total /
                            max) *
                          100
                        : 0;

                    return (
                      <div
                        className="comparison-row"
                        key={item.name}
                      >

                        <strong>
                          {item.name}
                        </strong>

                        <div className="bar-container">
                          <div
                            className="bar"
                            style={{
                              width:
                                `${width}%`,
                            }}
                          />
                        </div>

                        <span>
                          {item.total}
                        </span>

                        <small>
                          Avg {item.average}
                        </small>

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}


          {/* INFO */}

          <section className="card algorithm-info">

            <h3>
              {algorithm}
            </h3>

            <p>
              {algorithm === "FCFS" &&
                "Processes requests in their arrival order."}

              {algorithm === "SSTF" &&
                "Selects the pending request closest to the current head."}

              {algorithm === "SCAN" &&
                "Moves in one direction and reverses at the disk boundary."}

              {algorithm === "C-SCAN" &&
                "Moves in one direction, returns to the beginning, and continues."}

              {algorithm === "LOOK" &&
                "Moves in one direction and reverses at the last request."}

              {algorithm === "C-LOOK" &&
                "Moves in one direction and jumps to the first request after reaching the last request."}
            </p>

          </section>

        </main>

      </div>

    </div>
  );
}

export default App;