import { useState, useEffect, useRef } from "react";
import styles from "./FlashTest.module.css";
import SettingsModal from "./SettingsModal";

export default function FlashTest() {
  const [stage, setStage] = useState("idle"); // idle | flash | answer | result
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // controla ciclo contínuo
  const [isRunning, setIsRunning] = useState(false);

  // timers refs para limpar corretamente
  const showTimerRef = useRef(null);
  const gapTimerRef = useRef(null);
  const resultTimerRef = useRef(null);

  // ⚙️ Configurações (agora com subtractions e continuous opcionais)
  const [settings, setSettings] = useState({
    digits: 1,
    count: 5,
    flashTime: 800,
    intervalTime: 300,
    voice: false,
    language: "pt-BR",
    subtractions: false, // accessory
    continuous: false,   // accessory
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // utility: limpa timers ativos
  const clearAllTimers = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (gapTimerRef.current) {
      clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
  };

  // 🔢 Gera sequência (se subtractions ativado, randomiza sinal para metade dos itens)
  const generateSequence = () => {
    const seq = [];
    for (let i = 0; i < settings.count; i++) {
      const min = Math.pow(10, Math.max(0, settings.digits - 1));
      const max = Math.pow(10, settings.digits) - 1;
      // edge: digits=1 -> min=1, max=9
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      const val = settings.subtractions && Math.random() > 0.5 ? -n : n;
      seq.push(val);
    }
    return seq;
  };

  // start a single sequence (não altera isRunning)
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

  // ▶️ Start (se continuous marcado -> entra em ciclo; caso contrário executa só um teste)
  const startTest = () => {
    if (settings.continuous) {
      // ativar ciclo contínuo
      setIsRunning(true);
    }
    startSequence();
  };

  // ⏹️ Stop ciclo contínuo
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
    // replay: inicia outra sequência (sem alterar isRunning)
    startSequence();
  };

  // 🔊 fala número (se voz ativada)
  const speakNumber = (num) => {
    if (!settings.voice) return;
    if (!window.speechSynthesis) return;
    try {
      const utterance = new SpeechSynthesisUtterance(num.toString());
      utterance.lang = settings.language;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // swallow if speech synthesis throws
      // console.warn("Speech error", e);
    }
  };

  // ⏱️ Lógica de exibição: cada número tem duas fases (visível por flashTime, depois intervalo)
  useEffect(() => {
    if (stage !== "flash") return;

    // se passou do último elemento -> ir para answer (modo normal) ou result (modo contínuo)
    if (currentIndex >= sequence.length) {
      setIsShowing(false);
      if (settings.continuous && isRunning) {
        setStage("result"); // mostra "= X" diretamente
      } else {
        setStage("answer"); // mostra "?" e permite input
      }
      return;
    }

    // mostra número atual
    setIsShowing(true);
    speakNumber(sequence[currentIndex]);

    // start timers: mostrar -> esconder -> intervalo -> próximo
    // guardamos timers em refs para limpar corretamente
    const showTimer = setTimeout(() => {
      setIsShowing(false);
      gapTimerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, Math.max(0, settings.intervalTime));
    }, Math.max(0, settings.flashTime));

    showTimerRef.current = showTimer;

    return () => {
      // cleanup sempre limpa ambos
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (gapTimerRef.current) {
        clearTimeout(gapTimerRef.current);
        gapTimerRef.current = null;
      }
    };
  }, [
    stage,
    currentIndex,
    sequence,
    settings.flashTime,
    settings.intervalTime,
    settings.language,
    settings.voice,
    settings.continuous,
    isRunning,
  ]);

  // ✅ Verificar resposta (modo normal)
  const checkAnswer = () => {
    setScore(Number(userAnswer) === correctAnswer);
    setStage("result");
  };

  // ♾️ Comportamento no resultado:
  // - modo contínuo + isRunning: mostra "= X", aguarda 2000ms e inicia nova sequência
  // - modo normal: mostra acerto/erro até o usuário iniciar novo teste
  useEffect(() => {
    // Limpa se entrar em outro stage
    if (stage !== "result") {
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
        resultTimerRef.current = null;
      }
      return;
    }

    if (settings.continuous && isRunning) {
      // mostra "= X" por 2s e inicia próximo
      resultTimerRef.current = setTimeout(() => {
        startSequence();
      }, 2000);
      return () => {
        if (resultTimerRef.current) {
          clearTimeout(resultTimerRef.current);
          resultTimerRef.current = null;
        }
      };
    }

    // se não for modo contínuo, não iniciamos nada automático
    return undefined;
  }, [stage, settings.continuous, isRunning]);

  // Se desmarcar continuous enquanto estiver rodando, paramos o ciclo
  useEffect(() => {
    if (!settings.continuous && isRunning) {
      stopTest();
    }
    // se marcar continuous não inicia automaticamente (usuário precisa clicar Play)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.continuous]);

  // cleanup global ao desmontar
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Área do número */}
      <div className={styles.flashArea}>
        {stage === "flash" && currentIndex < sequence.length && (
          isShowing ? sequence[currentIndex] : ""
        )}

        {/* modo normal: ponto de interrogação aguardando resposta */}
        {stage === "answer" && !settings.continuous && "?"}

        {/* resultado */}
        {stage === "result" && (
          settings.continuous && isRunning ? (
            <div>= {correctAnswer}</div> // ciclo contínuo: mostra "= X"
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
        {/* Play / Stop logic */}
        {settings.continuous ? (
          isRunning ? (
            <button className={`${styles.button} ${styles.stop}`} onClick={stopTest}>
              Stop
            </button>
          ) : (
            <button className={`${styles.button} ${styles.play}`} onClick={startTest}>
              Play
            </button>
          )
        ) : (
          <>
            <button className={`${styles.button} ${styles.play}`} onClick={startTest}>
              Play
            </button>
            <button className={`${styles.button} ${styles.replay}`} onClick={replayTest}>
              Replay
            </button>
          </>
        )}

        <button className={`${styles.button} ${styles.settings}`} onClick={() => setShowSettings(true)}>
          Settings
        </button>
        <button className={`${styles.button} ${styles.history}`}>
          History
        </button>

        {/* Input e Check aparecem apenas no modo normal */}
        {!settings.continuous && (
          <>
            <input
              type="number"
              placeholder="Your answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={styles.inputAnswer}
              disabled={stage !== "answer"}
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

      {/* Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          handleChange={handleChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}