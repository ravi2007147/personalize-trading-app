import React, { useEffect, useState } from "react";

export default function TradingTimingAlertApp() {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState({
    time: "",
    weekday: "",
    date: "",
    overall: "",
  });
  const [currentTime, setCurrentTime] = useState("");
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    const checkConditions = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday
      const date = now.getDate();
      const timeStr = now.toLocaleTimeString();
      setCurrentTime(timeStr);

      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = weekdays[day];

      // Calculate root number of date (e.g., 14 -> 1+4 = 5)
      const digitSum = (n) => {
        while (n > 9) {
          n = n
            .toString()
            .split("")
            .reduce((a, b) => a + Number(b), 0);
        }
        return n;
      };

      const dateRoot = digitSum(date);
      const luckyRoots = [1, 3, 5];
      const unluckyRoots = [4, 8, 9];

      const luckyDays = ["Monday", "Wednesday", "Friday"];
      const riskyTimes =
        (dayName === "Tuesday" && hour >= 9 && hour < 11) ||
        (dayName === "Saturday" && hour >= 13 && hour < 15);
      const neutralTime = hour >= 14 && hour < 15;
      const bestTime =
        (dayName === "Wednesday" || dayName === "Friday") &&
        hour >= 9 &&
        hour < 11;

      const isLuckyDate = luckyRoots.includes(dateRoot);
      const isUnluckyDate = unluckyRoots.includes(dateRoot);
      const isLuckyDay = luckyDays.includes(dayName);

      // Build component-wise analysis
      const timeEval = riskyTimes
        ? "❌ Bad trading hour"
        : bestTime
        ? "✅ Best trading hour"
        : neutralTime
        ? "✅ Stable hour"
        : "⚠️ Neutral trading hour";

      const dayEval = isLuckyDay
        ? "✅ Favorable weekday"
        : dayName === "Tuesday" || dayName === "Saturday"
        ? "❌ Risky weekday"
        : "⚠️ Moderate weekday";

      const dateEval = isLuckyDate
        ? "✅ Lucky numerology date"
        : isUnluckyDate
        ? "❌ Unlucky numerology date"
        : "⚠️ Neutral date";

      // Final Decision
      let overall = "⚠️ OK to trade with confirmation";
      let customAdvice =
        "Avoid overtrading or emotional decisions. Focus on logic and clear setups.";

      if (
        timeEval.includes("❌") ||
        dayEval.includes("❌") ||
        dateEval.includes("❌")
      ) {
        overall = "🚫 Strictly avoid trading";
        customAdvice =
          "Conditions are unfavorable. Better to avoid trading right now.";
      } else if (
        timeEval.includes("✅") &&
        dayEval.includes("✅") &&
        dateEval.includes("✅")
      ) {
        overall = "🌟 Perfect day to trade";
        customAdvice =
          "Everything is aligned! Great time for focused and confident trades.";
      } else if (
        (timeEval.includes("✅") || dayEval.includes("✅")) &&
        !dateEval.includes("❌")
      ) {
        overall = "✅ Good time to trade";
        customAdvice =
          "You have favorable energies. Consider trading with proper confirmation.";
      } else {
        customAdvice =
          "Some factors are neutral. Trade small or wait for a better setup.";
      }

      setStatus(overall);
      setReason({
        time: timeEval,
        weekday: dayEval,
        date: dateEval,
        overall,
      });
      setAdvice(customAdvice);
    };

    checkConditions();
    const interval = setInterval(checkConditions, 60 * 1000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto text-center border rounded-xl shadow-xl mt-10">
      <h1 className="text-2xl font-bold mb-4">📈 Trading Time Advisor</h1>
      <p className="mb-2">
        Current Time: <strong>{currentTime}</strong>
      </p>
      <div className="text-xl font-semibold mt-4">{status}</div>
      <div className="mt-6 text-left">
        <p>🕒 Time Check: {reason.time}</p>
        <p>📅 Weekday Check: {reason.weekday}</p>
        <p>🔢 Numerology Date Check: {reason.date}</p>
      </div>
      <div className="mt-4 p-3 bg-blue-50 border rounded">
        <p className="text-sm text-gray-700">
          💡 <strong>Advice:</strong> {advice}
        </p>
      </div>
    </div>
  );
}
