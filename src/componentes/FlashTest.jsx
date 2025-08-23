import { useState, useEffect, useRef } from "react";
import styles from "./FlashTest.module.css";
import SettingsModal from "./SettingsModal";
import HistoryModal from "./HistoryModal";

export default function FlashTest() {
  const [stage, setStage] = useState("idle"); // idle | flash | answer | result
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(null);

  // modais
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // histórico
  const [history, setHistory] = useState([]);

  // controla ciclo contínuo
  const [isRunning, setIsRunning] = useState(false);

  // timers refs para limpar corretamente
  const showTimerRef = useRef(null);
  const gapTimerRef = useRef(null);
  const resultTimerRef = useRef(null);
  const answerTimerRef = useRef(null);

  // input ref para focar automaticamente
  const inputRef = useRef(null);

  // ⚙️ Configurações
  const [settings, setSettings] = useState({
    digits: 1,
    count: 5,
    flashTime: 800,
    intervalTime: 300,
    voice: false,
    language: "pt-BR",
    subtractions: false,
    continuous: false,
    fontSize: 100, // controla APENAS números e símbolos (= ? + -)
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // utility: limpa timers ativos
  const clearAllTimers = () => {
    [showTimerRef, gapTimerRef, resultTimerRef, answerTimerRef].forEach((ref) => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  };

  // 🔢 Gera sequência (resultado final ≥ 0)
  const generateSequence = () => {
    const seq = [];
    let runningTotal = 0;

    for (let i = 0; i < settings.count; i++) {
      const min = Math.pow(10, Math.max(0, settings.digits - 1));
      const max = Math.pow(10, settings.digits) - 1;
      const n = Math.floor(Math.random() * (max - min + 1)) + min;

      let val = n;
      if (settings.subtractions && Math.random() > 0.5) {
        if (runningTotal - n >= 0) {
          val = -n;
        }
      }

      seq.push(val);
      runningTotal += val;
    }

    return seq;
  };

  // salva sequência no histórico (apenas no modo normal)
  const saveToHistory = (seq) => {
    const expression = seq
      .map((n, idx) =>
        idx === 0 ? n : n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`
      )
      .join(" ");
    setHistory((prev) => {
      const updated = [expression, ...prev];
      return updated.slice(0, 20);
    });
  };

  // start uma sequência
  const startSequence = () => {
    clearAllTimers();
    const seq = generateSequence();
    setSequence(seq);
    setCorrectAnswer(seq.reduce((a, b) => a + b, 0));
    setStage("flash");
    setCurrentIndex(0);
    setIsShowing(true);
    setUserAnswer("");
    setScore(null);
  };

  // ▶️ Start
  const startTest = () => {
    setIsRunning(true);
    startSequence();
  };

  // ⏹️ Stop
  const stopTest = () => {
    setIsRunning(false);
    clearAllTimers();
    setStage("idle");
    setSequence([]);
    setCurrentIndex(0);
    setIsShowing(false);
    setUserAnswer("");
  };

  const replayTest = () => {
    startSequence();
  };

  // 🔊 fala número
  const speakNumber = (num) => {
    if (!settings.voice || !window.speechSynthesis) return;
    try {
      const utterance = new SpeechSynthesisUtterance(num.toString());
      utterance.lang = settings.language;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  // ⏱️ lógica de exibição dos números
  useEffect(() => {
    if (stage !== "flash") return;

    if (currentIndex >= sequence.length) {
      setIsShowing(false);
      setStage("answer"); // sempre vai para "answer"
      return;
    }

    setIsShowing(true);
    speakNumber(sequence[currentIndex]);

    const showTimer = setTimeout(() => {
      setIsShowing(false);
      gapTimerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, Math.max(0, settings.intervalTime));
    }, Math.max(0, settings.flashTime));

    showTimerRef.current = showTimer;

    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(gapTimerRef.current);
    };
  }, [
    stage,
    currentIndex,
    sequence,
    settings.flashTime,
    settings.intervalTime,
    settings.language,
    settings.voice,
  ]);

  // 👁️ mostra "?" no contínuo por 1s e depois passa para result
  useEffect(() => {
    if (stage !== "answer" || !settings.continuous || !isRunning) return;

    answerTimerRef.current = setTimeout(() => {
      setStage("result");
    }, 1000);

    return () => {
      if (answerTimerRef.current) {
        clearTimeout(answerTimerRef.current);
        answerTimerRef.current = null;
      }
    };
  }, [stage, settings.continuous, isRunning]);

  // ✅ Verificar resposta (modo normal)
  const checkAnswer = () => {
    setScore(Number(userAnswer) === correctAnswer);
    setStage("result");
    if (!settings.continuous) {
      saveToHistory(sequence); // salva apenas em modo normal
    }
  };

  // ♾️ comportamento no resultado
  useEffect(() => {
    if (stage !== "result") {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
      return;
    }

    if (settings.continuous && isRunning) {
      resultTimerRef.current = setTimeout(() => {
        startSequence();
      }, 2000);
      return () => clearTimeout(resultTimerRef.current);
    } else {
      setIsRunning(false); // garante que no modo normal volte para idle
    }
  }, [stage, settings.continuous, isRunning]);

  // se desligar continuous enquanto roda → para
  useEffect(() => {
    if (!settings.continuous && isRunning && stage === "idle") {
      stopTest();
    }
  }, [settings.continuous]); // eslint-disable-line react-hooks/exhaustive-deps

  // cleanup global
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // helper para renderizar APENAS os símbolos/dígitos grandes
  const Big = ({ children }) => (
    <span style={{ fontSize: settings.fontSize || 72, lineHeight: 1 }}>
      {children}
    </span>
  );

  // Focar input quando entrar em "answer"
  useEffect(() => {
    if (stage === "answer" && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      // opcional: seleciona qualquer valor já digitado
      inputRef.current.select?.();
    }
  }, [stage]);

  // === Atalhos de teclado ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Sempre permitir Enter para checar, mesmo com foco no input
      if (key === "enter" && stage === "answer") {
        e.preventDefault();
        checkAnswer();
        return;
      }

      // Ignora outros atalhos se estiver digitando em um input/textarea
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      switch (key) {
        case "p": // play/stop
          if (isRunning) {
            stopTest();
          } else {
            startTest();
          }
          break;

        case "r": // replay (se já teve sequência)
          if (!isRunning && sequence.length > 0) {
            replayTest();
          }
          break;

        case "s": // abre settings
          setShowSettings(true);
          break;

        case "h": // abre histórico
          setShowHistory(true);
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, sequence.length, stage, userAnswer]); // deps atualizados

  return (
    <div className={styles.container}>
      {/* Área do número */}
      <div className={styles.flashArea}>
        {stage === "flash" && currentIndex < sequence.length && (
          isShowing ? <Big>{String(sequence[currentIndex])}</Big> : ""
        )}

        {/* mostra ? em answer (tanto normal quanto contínuo) */}
        {stage === "answer" && <Big>?</Big>}

        {/* resultado */}
        {stage === "result" && (
          settings.continuous && isRunning ? (
            <Big>= {correctAnswer}</Big>
          ) : (
            <div>
              {score ? "✅ Acertou!" : "❌ Errou"}<br />
              <small>Resposta correta: {correctAnswer}</small>
            </div>
          )
        )}
      </div>

      {/* Barra inferior */}
      <div className={styles.bottomBar}>
        {isRunning ? (
          <button className={`${styles.button} ${styles.stop}`} onClick={stopTest}>
            Stop
          </button>
        ) : (
          <>
            <button className={`${styles.button} ${styles.play}`} onClick={startTest}>
              Play
            </button>
            {!settings.continuous && (
              <button className={`${styles.button} ${styles.replay}`} onClick={replayTest}>
                Replay
              </button>
            )}
          </>
        )}

        <button
          className={`${styles.button} ${styles.settings}`}
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
        <button
          className={`${styles.button} ${styles.history}`}
          onClick={() => setShowHistory(true)}
        >
          History
        </button>

        {!settings.continuous && (
          <>
            <input
              ref={inputRef}
              type="number"
              placeholder="Your answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={styles.inputAnswer}
              disabled={stage !== "answer"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && stage === "answer") {
                  e.preventDefault();
                  checkAnswer();
                }
              }}
            />
            <button
              className={`${styles.button} ${styles.check}`}
              onClick={checkAnswer}
              disabled={stage !== "answer"}
            >
              Check
            </button>
          </>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          handleChange={handleChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHistory && (
        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          history={history}
        />
      )}
    </div>
  );
}