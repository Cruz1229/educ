// Single style source for the preview and the standalone HTML.
export const MAGIX_PREVIEW_STYLES = `
.magix-shell {
  --blue: #176b87;
  --blue-dark: #0f4f68;
  --blue-light: #e8f4f7;
  --coral: #f47c67;
  --coral-dark: #dc5f4b;
  --cream: #fffaf2;
  --ink: #173042;
  --muted: #647784;
  --line: #dce6e9;
  align-items: flex-start;
  background:
    radial-gradient(circle at 12% 12%, rgb(244 124 103 / 10%) 0 110px, transparent 112px),
    radial-gradient(circle at 92% 86%, rgb(23 107 135 / 10%) 0 170px, transparent 172px),
    #f3f7f7;
  color: var(--ink);
  display: flex;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.magix-shell *,
.magix-shell *::before,
.magix-shell *::after {
  box-sizing: border-box;
}

.magix-shell button {
  font: inherit;
}

.magix-icon {
  display: block;
  flex: 0 0 auto;
}

.magix-card {
  background: rgb(255 255 255 / 96%);
  border: 1px solid rgb(23 107 135 / 10%);
  border-radius: 24px;
  box-shadow: 0 22px 60px rgb(23 48 66 / 12%);
  max-width: 1160px;
  min-height: calc(100vh - 48px);
  overflow: hidden;
  padding: 28px;
  position: relative;
  width: 100%;
}

.magix-shell--selection {
  background: #fff;
  padding: 0;
}

.magix-card--selection {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  max-width: none;
  min-height: 100vh;
  padding: 34px 24px;
}

.magix-header {
  align-items: center;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  padding: 0 2px 22px;
}

.magix-kicker {
  color: var(--coral-dark);
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .13em;
  margin: 0;
  text-transform: uppercase;
}

.magix-header h1 {
  font-size: clamp(2.25rem, 5vw, 3.35rem);
  letter-spacing: -.06em;
  line-height: .9;
  margin: 7px 0 5px;
}

.magix-header h1 span {
  color: var(--blue);
}

.magix-subtitle {
  color: var(--muted);
  font-size: .9rem;
  font-weight: 600;
  margin: 0;
}

.magix-header__actions {
  align-items: center;
  display: flex;
  gap: 12px;
}

.magix-score {
  align-items: center;
  background: var(--cream);
  border: 1px solid #f4e2c7;
  border-radius: 14px;
  color: var(--coral-dark);
  display: grid;
  gap: 0 8px;
  grid-template-columns: auto auto;
  padding: 8px 14px;
}

.magix-score .magix-icon {
  grid-row: 1 / 3;
}

.magix-score span {
  color: var(--muted);
  font-size: .67rem;
  font-weight: 750;
  text-transform: uppercase;
}

.magix-score strong {
  color: var(--ink);
  font-size: 1.12rem;
  line-height: 1;
}

.magix-icon-button {
  align-items: center;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  color: var(--blue);
  cursor: pointer;
  display: flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.magix-icon-button:hover {
  background: var(--blue-light);
}

.magix-selection {
  padding: clamp(36px, 5vw, 64px) 0 clamp(60px, 9vw, 110px);
  text-align: center;
}

.magix-selection__hero {
  align-items: center;
  display: flex;
  flex-direction: column;
}

.magix-selection h2,
.magix-finished h2 {
  font-size: clamp(2rem, 5vw, 3.1rem);
  letter-spacing: -.045em;
}

.magix-selection h2 {
  margin: 0 0 34px;
}

.magix-selection__icon {
  align-items: center;
  background: #f7fbfc;
  border: 2px solid #d8e9ee;
  border-radius: 16px;
  box-shadow: 0 5px 14px rgb(23 107 135 / 10%);
  color: #7eb8ca;
  display: inline-flex;
  height: 94px;
  justify-content: center;
  width: 94px;
}

.magix-selection__category {
  background: rgba(0, 86, 179, 0.12);
  color: #0056b3;
  border: 1px solid rgba(0, 119, 182, 0.25);
  border-radius: 999px;
  font-size: .64rem;
  font-weight: 850;
  letter-spacing: .1em;
  margin-top: 10px;
  padding: 5px 12px;
  text-transform: uppercase;
}

.magix-challenge-info {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-left: 6px solid #0077b6;
  border-radius: 8px;
  color: #0369a1;
  margin-top: clamp(42px, 7vw, 74px);
  padding: 22px 20px;
  text-align: left;
}

.magix-challenge-info__title {
  align-items: center;
  display: flex;
  gap: 8px;
}

.magix-challenge-info__title strong {
  font-size: 1.05rem;
}

.magix-challenge-info p {
  font-size: .82rem;
  line-height: 1.6;
  margin: 8px 0 0;
}

.magix-level-picker {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 42px;
}

.magix-level-picker label {
  color: var(--ink);
  font-size: .88rem;
  font-weight: 750;
}

.magix-level-picker select {
  appearance: auto;
  background: #fff;
  border: 1px solid #cbd7dc;
  border-radius: 10px;
  color: var(--ink);
  cursor: pointer;
  font-size: .87rem;
  font-weight: 700;
  min-width: 245px;
  padding: 10px 14px;
}

.magix-level-picker select:hover {
  border-color: var(--blue);
}

.magix-level-picker__continue {
  min-width: 112px;
}

.magix-gamebar {
  align-items: stretch;
  background: #f7fafb;
  border: 1px solid var(--line);
  border-radius: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 22px;
  overflow: hidden;
}

.magix-gamebar>div {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 12px 18px;
}

.magix-gamebar>div+div {
  border-left: 1px solid var(--line);
}

.magix-gamebar span {
  color: var(--muted);
  font-size: .75rem;
  font-weight: 700;
}

.magix-gamebar strong {
  font-size: 1rem;
}

.magix-timer {
  color: var(--blue);
}

.magix-timer.is-urgent {
  animation: magix-pulse 900ms infinite;
  background: #fff0ed;
  color: var(--coral-dark);
}

.magix-game-intro {
  padding: 12px 0 20px;
  text-align: center;
}

.magix-game-intro h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
  letter-spacing: -.045em;
  margin: 0;
}

.magix-game-intro__subtitle {
  color: var(--muted);
  font-size: .94rem;
  font-weight: 650;
  margin: 5px 0 18px;
}

.magix-rules {
  background: #edf5ff;
  border: 1px solid #bad7f7;
  border-radius: 12px;
  color: #164a77;
  margin: 0 auto;
  max-width: 650px;
  padding: 13px 20px;
}

.magix-rules h2 {
  align-items: center;
  display: flex;
  font-size: .7rem;
  gap: 6px;
  justify-content: center;
  letter-spacing: .08em;
  margin: 0 0 7px;
  text-transform: uppercase;
}

.magix-rules p {
  font-size: .79rem;
  line-height: 1.45;
  margin: 0;
}

.magix-rules p+p {
  margin-top: 2px;
}

.magix-exercise {
  background: #f7fafb;
  border: 1px solid var(--line);
  border-radius: 13px;
  margin-bottom: 18px;
  padding: 15px 20px;
  text-align: center;
}

.magix-exercise h2 {
  font-size: 1.18rem;
  margin: 5px 0 0;
}

.magix-layout {
  align-items: start;
  display: grid;
  gap: 22px;
  grid-template-columns: minmax(0, 1fr) 310px;
}

.magix-stage {
  border: 1px solid var(--line);
  border-radius: 20px;
  min-width: 0;
  padding: 22px;
}

.magix-link-button {
  background: none;
  border: 0;
  color: var(--blue);
  cursor: pointer;
  font-size: .82rem;
  font-weight: 750;
  padding: 5px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.magix-triangle-wrap {
  height: 405px;
  margin: 6px auto 0;
  max-width: 610px;
  position: relative;
  width: 100%;
}

.magix-triangle-lines {
  height: 100%;
  inset: 0;
  overflow: visible;
  position: absolute;
  width: 100%;
}

.magix-triangle-lines path {
  fill: rgb(23 107 135 / 3%);
  stroke: var(--blue);
  stroke-dasharray: 5 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.magix-target-badge {
  align-items: center;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 13px;
  box-shadow: 0 8px 20px rgb(23 48 66 / 8%);
  display: flex;
  flex-direction: column;
  left: 50%;
  padding: 8px 15px;
  position: absolute;
  top: 48%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.magix-target-badge span {
  color: var(--muted);
  font-size: .63rem;
  font-weight: 750;
  text-transform: uppercase;
}

.magix-target-badge strong {
  color: var(--blue);
  font-size: 1.6rem;
  line-height: 1.15;
}

.magix-slot {
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  font-size: 1.35rem;
  font-weight: 850;
  height: 54px;
  justify-content: center;
  position: absolute;
  transform: translate(-50%, -50%);
  transition: transform 150ms ease, background 150ms ease;
  width: 54px;
  z-index: 3;
}

.magix-slot:not(:disabled):hover {
  transform: translate(-50%, -50%) scale(1.08);
}

.magix-slot.is-empty {
  background: #fff;
  border: 2px dashed #9eb7bf;
  color: #9eb7bf;
}

.magix-slot.is-filled {
  background: var(--coral);
  border: 3px solid #fff;
  box-shadow: 0 5px 14px rgb(220 95 75 / 28%);
  color: #fff;
}

.magix-slot--0 {
  left: 50%;
  top: 8.7%;
}

.magix-slot--1 {
  left: 31%;
  top: 48%;
}

.magix-slot--2 {
  left: 12%;
  top: 87%;
}

.magix-slot--3 {
  left: 50%;
  top: 87%;
}

.magix-slot--4 {
  left: 88%;
  top: 87%;
}

.magix-slot--5 {
  left: 69%;
  top: 48%;
}

.magix-side-total {
  background: #f7fafb;
  border: 1px solid var(--line);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  padding: 7px 10px;
  position: absolute;
  text-align: center;
  z-index: 2;
}

.magix-side-total span {
  color: var(--muted);
  font-size: .58rem;
  font-weight: 800;
  text-transform: uppercase;
}

.magix-side-total strong {
  font-size: .78rem;
  margin-top: 3px;
}

.magix-side-total--0 {
  left: 9%;
  top: 43%;
}

.magix-side-total--1 {
  bottom: 2%;
  left: 31%;
}

.magix-side-total--2 {
  right: 9%;
  top: 43%;
}

.magix-side-total.is-correct {
  background: #ecfdf3;
  border-color: #86d9a7;
  color: #177543;
}

.magix-side-total.is-wrong {
  background: #fff0ed;
  border-color: #f2a395;
  color: #b93e2b;
}

.magix-message {
  color: var(--muted);
  font-size: .8rem;
  min-height: 20px;
  text-align: center;
}

.magix-message.is-visible {
  color: var(--blue-dark);
  font-weight: 700;
}

.magix-number-bank {
  background: var(--cream);
  border: 1px solid #f1e2cd;
  border-radius: 16px;
  margin-top: 8px;
  padding: 14px 16px;
}

.magix-number-bank__heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.magix-number-bank__heading span {
  font-size: .8rem;
  font-weight: 800;
}

.magix-number-bank__heading small {
  color: var(--muted);
  font-size: .67rem;
}

.magix-number-bank__items {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  justify-content: center;
  min-height: 44px;
}

.magix-number {
  background: #fff;
  border: 2px solid #f3c6bd;
  border-radius: 12px;
  color: var(--coral-dark);
  cursor: grab;
  font-size: 1.05rem;
  font-weight: 850;
  height: 44px;
  transition: transform 140ms ease, background 140ms ease;
  width: 50px;
}

.magix-number:hover,
.magix-number.is-selected {
  background: var(--coral);
  color: #fff;
  transform: translateY(-2px);
}

.magix-number.is-selected {
  box-shadow: 0 0 0 3px rgb(244 124 103 / 20%);
}

.magix-number-bank__empty {
  align-self: center;
  color: var(--muted);
  font-size: .78rem;
}

.magix-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  justify-content: center;
  margin-top: 16px;
}

.magix-actions--sidebar {
  flex-direction: column;
}

.magix-actions--sidebar .magix-button {
  width: 100%;
}

.magix-button {
  align-items: center;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  font-size: .82rem;
  font-weight: 800;
  gap: 7px;
  justify-content: center;
  min-height: 42px;
  padding: 9px 15px;
  transition: filter 150ms ease, transform 150ms ease;
}

.magix-button:hover:not(:disabled) {
  filter: brightness(.96);
  transform: translateY(-1px);
}

.magix-button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.magix-button--primary {
  background: var(--blue);
  border: 1px solid var(--blue);
  color: #fff;
}

.magix-button--ghost {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--blue);
}

.magix-button--danger {
  background: #fff;
  border: 1px solid #f2b7ad;
  color: var(--coral-dark);
}

.magix-button:focus-visible,
.magix-slot:focus-visible,
.magix-number:focus-visible,
.magix-level-picker select:focus-visible,
.magix-icon-button:focus-visible {
  outline-offset: 3px;
}

.magix-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.magix-panel {
  align-items: flex-start;
  background: var(--blue-light);
  border: 1px solid #cfe5eb;
  border-radius: 16px;
  display: flex;
  gap: 11px;
  padding: 15px;
}

.magix-panel--reward {
  background: var(--cream);
  border-color: #f1e2cd;
}

.magix-panel__icon {
  align-items: center;
  background: #fff;
  border-radius: 10px;
  color: var(--blue);
  display: flex;
  flex: 0 0 auto;
  height: 36px;
  justify-content: center;
  width: 36px;
}

.magix-panel--reward .magix-panel__icon {
  color: var(--coral-dark);
}

.magix-panel h2 {
  font-size: .9rem;
  margin: 1px 0 5px;
}

.magix-panel p {
  color: var(--muted);
  font-size: .76rem;
  line-height: 1.5;
  margin: 0;
}

.magix-progress-panel {
  background: #fff;
  border: 1px solid #ccd9df;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgb(23 48 66 / 6%);
  padding: 18px;
}

.magix-progress-panel__heading {
  align-items: center;
  border-bottom: 1px solid var(--line);
  display: flex;
  gap: 8px;
  padding-bottom: 11px;
}

.magix-progress-panel__heading h2 {
  font-size: 1.08rem;
  margin: 0;
}

.magix-progress-stats {
  border-bottom: 1px solid var(--line);
  margin: 0;
  padding: 12px 0;
}

.magix-progress-stats>div {
  align-items: center;
  display: flex;
  font-size: .78rem;
  justify-content: space-between;
  padding: 7px 0;
}

.magix-progress-stats dt {
  color: var(--muted);
}

.magix-progress-stats dd {
  font-weight: 800;
  margin: 0;
}

.magix-progress-stats dd.is-urgent {
  color: var(--coral-dark);
}

.magix-progress-stats__score {
  color: var(--blue);
}

.magix-progress-status {
  padding-top: 14px;
}

.magix-progress-status>span {
  color: var(--muted);
  display: block;
  font-size: .72rem;
  margin-bottom: 9px;
}

.magix-progress-steps {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.magix-progress-steps span {
  align-items: center;
  background: #e8eef1;
  border: 1px solid #d2dee3;
  border-radius: 50%;
  color: #83949d;
  display: flex;
  font-size: .65rem;
  font-weight: 800;
  height: 22px;
  justify-content: center;
  width: 22px;
}

.magix-progress-steps span.is-complete {
  background: var(--blue-light);
  border-color: var(--blue);
  color: var(--blue);
}

.magix-progress-status progress {
  accent-color: var(--blue);
  display: block;
  height: 8px;
  width: 100%;
}

.magix-finished {
  padding: clamp(70px, 12vw, 150px) 20px;
  text-align: center;
}

.magix-finished>span {
  color: var(--coral-dark);
}

.magix-finished p:not(.magix-kicker) {
  color: var(--muted);
  margin: 0 0 24px;
}

.magix-modal-backdrop {
  align-items: center;
  animation: magix-fade 180ms ease-out;
  background: rgb(12 32 44 / 65%);
  backdrop-filter: blur(4px);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 100;
}

.magix-modal {
  animation: magix-pop 220ms ease-out;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 24px 70px rgb(0 0 0 / 25%);
  max-width: 470px;
  padding: 34px;
  position: relative;
  text-align: center;
  width: 100%;
}

.magix-modal__symbol {
  align-items: center;
  background: var(--blue-light);
  border-radius: 50%;
  color: var(--blue);
  display: inline-flex;
  height: 70px;
  justify-content: center;
  margin-bottom: 15px;
  width: 70px;
}

.magix-modal--success .magix-modal__symbol {
  background: #ecfdf3;
  color: #198754;
}

.magix-modal--timeout .magix-modal__symbol {
  background: #fff0ed;
  color: var(--coral-dark);
}

.magix-modal h2 {
  font-size: 1.9rem;
  letter-spacing: -.035em;
  margin: 7px 0 9px;
}

.magix-modal>p:not(.magix-kicker) {
  color: var(--muted);
  line-height: 1.55;
  margin: 0 0 14px;
}

.magix-modal__score {
  background: #f7fafb;
  border-radius: 10px;
  display: inline-block;
  font-size: .9rem;
  padding: 9px 13px;
}

.magix-modal__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 22px;
}

.magix-modal__close {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  padding: 8px;
  position: absolute;
  right: 12px;
  top: 12px;
}

.magix-modal--info {
  max-width: 540px;
}

.magix-modal--info ol {
  color: var(--muted);
  font-size: .9rem;
  line-height: 1.55;
  margin: 20px 0 24px;
  padding-left: 24px;
  text-align: left;
}

.magix-modal--info li+li {
  margin-top: 9px;
}

@keyframes magix-fade {
  from {
    opacity: 0;
  }
}

@keyframes magix-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(.98);
  }
}

@keyframes magix-pulse {
  50% {
    background: #ffe0da;
  }
}

@media (max-width: 850px) {
  .magix-layout {
    grid-template-columns: 1fr;
  }

  .magix-sidebar {
    display: block;
  }

  .magix-progress-panel {
    margin: 0 auto;
    max-width: 520px;
  }
}

@media (max-width: 620px) {
  .magix-shell {
    padding: 0;
  }

  .magix-card {
    border: 0;
    border-radius: 0;
    min-height: 100vh;
    padding: 18px 14px;
  }

  .magix-card--selection {
    padding-top: 28px;
  }

  .magix-header {
    padding-bottom: 17px;
  }

  .magix-header h1 {
    font-size: 2.25rem;
  }

  .magix-score {
    padding: 7px 10px;
  }

  .magix-score span {
    display: none;
  }

  .magix-score .magix-icon {
    grid-row: auto;
  }

  .magix-icon-button {
    height: 43px;
    width: 43px;
  }

  .magix-selection {
    padding: 36px 0 64px;
  }

  .magix-selection h2 {
    margin-bottom: 26px;
  }

  .magix-challenge-info {
    margin-top: 38px;
    padding: 18px 15px;
  }

  .magix-level-picker {
    align-items: stretch;
    flex-direction: column;
    margin: 32px auto 0;
    max-width: 300px;
  }

  .magix-level-picker select {
    min-width: 0;
    width: 100%;
  }

  .magix-level-picker__continue {
    width: 100%;
  }

  .magix-game-intro {
    padding-top: 4px;
  }

  .magix-rules {
    padding: 12px 10px;
  }

  .magix-exercise {
    margin-bottom: 16px;
    padding: 12px 8px;
  }

  .magix-stage {
    padding: 16px 8px;
  }

  .magix-exercise h2 {
    font-size: 1.05rem;
  }

  .magix-triangle-wrap {
    height: 335px;
  }

  .magix-slot {
    font-size: 1.08rem;
    height: 46px;
    width: 46px;
  }

  .magix-side-total--0 {
    left: 1%;
  }

  .magix-side-total--2 {
    right: 1%;
  }

  .magix-target-badge {
    padding: 6px 10px;
  }

  .magix-target-badge span {
    font-size: .52rem;
  }

  .magix-target-badge strong {
    font-size: 1.3rem;
  }

  .magix-modal {
    padding: 30px 20px;
  }

  .magix-modal__actions {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {

  .magix-number,
  .magix-slot,
  .magix-button,
  .magix-modal,
  .magix-modal-backdrop,
  .magix-timer.is-urgent {
    animation: none;
    transition: none;
  }
}
.magix-generator-shell {
  min-height: 85vh;
  width: 100%;
  padding: 24px;
  background: #fff;
  color: #173042;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.magix-generator-card {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 32px;
  border: 1px solid #dce6e9;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 34px rgb(23 48 66 / 10%);
}

.magix-setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.magix-setup h1 {
  display: flex;
  margin: 0;
  color: #176b87;
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.magix-setup h1 span {
  display: inline-block;
  animation: magixWave 1.8s ease-in-out infinite;
}

@keyframes magixWave {
  0%, 40%, 100% { transform: translateY(0); }
  20% { transform: translateY(-12px); }
}

.magix-game-logo {
  width: 118px;
  height: 118px;
  object-fit: contain;
}

.magix-category,
.magix-platform-badges span {
  padding: 7px 15px;
  border-radius: 999px;
  background: #e8f4f7;
  color: #0f4f68;
  font-weight: 800;
}

.magix-rules-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: min(760px, 100%);
  padding: 20px;
  border-left: 5px solid #f47c67;
  border-radius: 14px;
  background: #fffaf2;
}

.magix-rules-banner p { margin: 6px 0 0; }
.magix-setup label { font-weight: 800; }
.magix-setup select {
  width: min(430px, 100%);
  padding: 12px 14px;
  border: 1px solid #b9ced4;
  border-radius: 12px;
  background: #fff;
  color: #173042;
  font: inherit;
}

.magix-summary > h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #176b87;
}

.magix-summary > p { text-align: center; color: #647784; }
.magix-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
  margin: 26px 0;
}

.magix-summary-grid > div {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px 10px;
  align-items: center;
  padding: 16px;
  border: 1px solid #dce6e9;
  border-radius: 14px;
}

.magix-summary-grid svg { grid-row: 1 / 3; width: 21px; color: #176b87; }
.magix-summary-grid span { color: #647784; font-size: .84rem; }
.magix-summary-grid strong { overflow-wrap: anywhere; }
.magix-summary-parameters,
.magix-platform-badges,
.magix-summary-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.magix-summary-parameters strong {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fffaf2;
}

.magix-package-notice {
  width: min(650px, 100%);
  margin: 24px auto 0;
  padding: 12px;
  border: 1px dashed #b9ced4;
  border-radius: 12px;
  background: #f3f7f7;
}

.magix-download-progress {
  display: grid;
  gap: 8px;
  width: min(600px, 100%);
  margin: 20px auto;
}

.magix-download-progress progress { width: 100%; height: 14px; }
.magix-summary-actions svg { width: 18px; }
.magix-scope-note { display: block; margin-top: 24px; text-align: center; color: #647784; }

@media (max-width: 640px) {
  .magix-generator-shell { padding: 10px; }
  .magix-generator-card { padding: 20px 14px; }
}

`;
