import { useState, useEffect } from "react";
import styles from "./FlashTest.module.css";


export default function FlashTest() {
  const [stage, setStage] = useState("config"); // config | flash | answer | result
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashTime, setFlashTime] = useState(800); 
  const [intervalTime, setIntervalTime] = useState(300);
  const [count, setCount] = useState(5); 
  const [digits, setDigits] = useState(2); 
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(null);

  const generateSequence = () => {
    const seq = [];
    for (let i = 0; i < count; i++) {
      const min = Math.pow(10, digits - 1);
      const max = Math.pow(10, digits) - 1;
      seq.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return seq;
  };

  const startTest = () => {
    const seq = generateSequence();
    setSequence(seq);
    setCorrectAnswer(seq.reduce((a, b) => a + b, 0));
    setStage("flash");
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (stage === "flash") {
      if (currentIndex < sequence.length) {
        const timer = setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, flashTime + intervalTime);
        return () => clearTimeout(timer);
      } else {
        setStage("answer");
      }
    }
  }, [stage, currentIndex]);

  const checkAnswer = () => {
    setScore(Number(userAnswer) === correctAnswer);
    setStage("result");
  };

  return (
    <div className={styles.container}>
      {stage === "config" && (
        <div className={styles.config}>
          <h2>Configuração do Teste</h2>
          <div>
            <label>Qtd. Números: </label>
            <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </div>
          <div>
            <label>Dígitos: </label>
            <input type="number" value={digits} onChange={(e) => setDigits(Number(e.target.value))} />
          </div>
          <div>
            <label>Flash (ms): </label>
            <input type="number" value={flashTime} onChange={(e) => setFlashTime(Number(e.target.value))} />
          </div>
          <div>
            <label>Intervalo (ms): </label>
            <input type="number" value={intervalTime} onChange={(e) => setIntervalTime(Number(e.target.value))} />
          </div>
          <button onClick={startTest}>Iniciar</button>
        </div>
      )}

      {stage === "flash" && (
        <div className={styles.flashNumber}>
          {currentIndex < sequence.length ? sequence[currentIndex] : ""}
        </div>
      )}

      {stage === "answer" && (
        <div className={styles.answer}>
          <h2>Digite o resultado:</h2>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          <button onClick={checkAnswer}>Enviar</button>
        </div>
      )}

      {stage === "result" && (
        <div className={styles.result}>
          <h2>{score ? "✅ Acertou!" : "❌ Errou"}</h2>
          <p>Resposta correta: {correctAnswer}</p>
          <button onClick={() => setStage("config")}>Novo Teste</button>
        </div>
      )}
    </div>
  );
}