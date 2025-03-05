import { useEffect, useState } from "react";

interface SendNotificationButtonProps {
  onClick: () => void; // A função onClick não retorna nada
}

export default function SendNotificationButton({
  onClick,
}: SendNotificationButtonProps) {
  const [timer, setTimer] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => Math.max(prev - 0.1, 0)); // Garante que o timer não vai abaixo de 0
      }, 100);
    } else if (timer === 0) {
      setIsDisabled(false); // Reabilita o botão quando o timer chegar a 0
    }

    return () => clearInterval(interval); // Limpa o intervalo quando o timer chega a 0
  }, [timer]);

  const handleClick = () => {
    if (!isDisabled) {
      onClick(); // Chama a função `onClick` passada como prop
      setTimer(3); // Inicia o contador de 3 segundos
      setIsDisabled(true); // Desabilita o botão
    }
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      className="px-3 disabled:bg-black disabled:opacity-50 text-sm py-2 disabled:cursor-not-allowed hover:cursor-pointer enabled:hover:scale-105 transition-all bg-[#325036] hover:bg-[#15321a] text-[#ffffff] rounded-lg flex items-center justify-center"
    >
      {isDisabled ? `${timer.toFixed(1)}s` : "Chamar "} {/* Exibe o contador ou "Chamar" */}
    </button>
  );
}
