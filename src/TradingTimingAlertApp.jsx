// App with Settings and Dynamic ChatGPT Integration (with fallback to default kundli)
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TradingTimingAlertApp() {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem("userInfo");
    return saved
      ? JSON.parse(saved)
      : {
          name: "",
          dob: "",
          time: "",
          location: "",
          apiKey: "",
          astroData: null,
        };
  });

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
      const astro = userInfo.astroData || {
        luckyRoots: [1, 3, 5],
        unluckyRoots: [4, 8, 9],
        luckyDays: ["Monday", "Wednesday", "Friday"],
      };

      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const date = now.getDate();
      setCurrentTime(now.toLocaleTimeString());

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
      const luckyRoots = astro.luckyRoots;
      const unluckyRoots = astro.unluckyRoots;
      const luckyDays = astro.luckyDays;

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
      }

      setStatus(overall);
      setReason({ time: timeEval, weekday: dayEval, date: dateEval, overall });
      setAdvice(customAdvice);
    };

    checkConditions();
    const interval = setInterval(checkConditions, 60 * 1000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const handleSave = async () => {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a Vedic astrology expert. Based on the following user info, return a JSON with luckyRoots (1-9), unluckyRoots (1-9), and luckyDays (Mon–Sun). Only output the JSON.",
        },
        {
          role: "user",
          content: `Name: ${userInfo.name}, DOB: ${userInfo.dob}, Time: ${userInfo.time}, Location: ${userInfo.location}`,
        },
      ],
    };

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("OpenAI API Error:", res.status, errorText);
        alert(`OpenAI API Error: ${res.status}\n${errorText}`);
        return;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        alert("No response content from OpenAI.");
        return;
      }

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(content);
      } catch (err) {
        console.error("Failed to parse response:", content);
        alert("Response was not valid JSON. Check console.");
        return;
      }

      const newData = { ...userInfo, astroData: jsonResponse };
      localStorage.setItem("userInfo", JSON.stringify(newData));
      setUserInfo(newData);
    } catch (err) {
      console.error("Network or code error:", err);
      alert("Something went wrong. Check console for error.");
    }
  };

  return (
    <Tabs defaultValue="dashboard" className="p-4 max-w-xl mx-auto">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="dashboard">📈 Dashboard</TabsTrigger>
        <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <Card>
          <CardContent className="space-y-4 py-6 text-center">
            <h1 className="text-2xl font-bold">Trading Time Advisor</h1>
            <p>
              Current Time: <strong>{currentTime}</strong>
            </p>
            <div className="text-xl font-semibold">{status}</div>
            <div className="mt-4 text-left">
              <p>🕒 Time Check: {reason.time}</p>
              <p>📅 Weekday Check: {reason.weekday}</p>
              <p>🔢 Numerology Date Check: {reason.date}</p>
              <div className="mt-4 p-3 bg-blue-50 border rounded">
                <p className="text-sm text-gray-700">
                  💡 <strong>Advice:</strong> {advice}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardContent className="space-y-4 py-6">
            <Input
              placeholder="Your Name"
              value={userInfo.name}
              onChange={(e) =>
                setUserInfo({ ...userInfo, name: e.target.value })
              }
            />
            <Input
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={userInfo.dob}
              onChange={(e) =>
                setUserInfo({ ...userInfo, dob: e.target.value })
              }
            />
            <Input
              placeholder="Birth Time (HH:MM)"
              value={userInfo.time}
              onChange={(e) =>
                setUserInfo({ ...userInfo, time: e.target.value })
              }
            />
            <Input
              placeholder="Birth Location"
              value={userInfo.location}
              onChange={(e) =>
                setUserInfo({ ...userInfo, location: e.target.value })
              }
            />
            <Input
              placeholder="ChatGPT API Key"
              value={userInfo.apiKey}
              onChange={(e) =>
                setUserInfo({ ...userInfo, apiKey: e.target.value })
              }
            />
            <Button onClick={handleSave}>
              Save and Generate Astro Profile
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
