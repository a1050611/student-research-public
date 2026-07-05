"use client";

import React, { useState, useEffect } from "react";

// ==========================================
// ⚠️ 請在這裡填入你的 GitHub Token 與 Gist ID
// ==========================================
const GITHUB_TOKEN = "YOUR_GITHUB_TOKEN"; 
const GIST_ID = "c8eae5a8dc38b9dc62cfa6519ed176c9";

interface Task {
  id: string;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  progress: number;
}

interface DailyRecord {
  studyTime: number;
  punchedIn: boolean;
  tasks: Task[];
  customTitleNote: string;
}

export default function PublicDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [db, setDb] = useState<{ [date: string]: DailyRecord }>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentRecord = db[selectedDate] || {
    studyTime: 0,
    punchedIn: false,
    tasks: [],
    customTitleNote: "未命名研究任務",
  };

  // 從雲端 Gist 讀取資料
  const fetchFromCloud = async () => {
    if (GITHUB_TOKEN.startsWith("YOUR_")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.files["study_logs.json"].content;
        if (content && content.trim() !== "{}") {
          setDb(JSON.parse(content));
        }
      }
    } catch (err) {
      console.error("讀取雲端資料失敗:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFromCloud();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const totalProgressPercent = currentRecord.tasks.length > 0 
    ? Math.round(currentRecord.tasks.reduce((sum, t) => sum + Number(t.progress), 0) / currentRecord.tasks.length) 
    : 0;

  return (
    <div style={{ backgroundColor: "#eaeef3", minHeight: "100vh", fontFamily: "sans-serif", color: "#333", padding: "40px 20px" }}>
      
      {/* 核心看板容器 (完美還原 image_11.png 質感) */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        
        {/* 頂部標題列 */}
        <div style={{ padding: "30px", borderBottom: "1px solid #edf2f7", display: "flex", justifyContent: "between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", color: "#1a202c", fontWeight: "bold", margin: 0 }}>
              今日統計與研究看板
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            <label style={{ fontSize: "0.95rem", color: "#4a5568", fontWeight: "bold" }}>切換檢視日期：</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e0", color: "#2d3748", fontWeight: "600", outline: "none", cursor: "pointer" }} 
            />
            {isLoading && <span style={{ fontSize: "0.85rem", color: "#3182ce" }}>同步中...</span>}
          </div>
        </div>

        {/* 內容區塊 - 左右對稱排版 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "40px", padding: "40px" }}>
          
          {/* 左側：任務進度總覽 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "#2d3748", fontWeight: "bold", marginBottom: "20px" }}>任務進度總覽</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "25px", backgroundColor: "#f8fafc", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                
                {/* 圓形進度圖示效果 */}
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", border: "8px solid #3182ce", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: "bold", color: "#3182ce", backgroundColor: "#fff" }}>
                  {totalProgressPercent}%
                </div>
                
                <div>
                  <div style={{ fontSize: "0.95rem", color: "#718096", marginBottom: "4px" }}>
                    當前日期：<span style={{ color: "#2d3748", fontWeight: "600" }}>{selectedDate.replace(/-/g, "/")}</span>
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "#718096" }}>
                    今日累計建立任務數：<span style={{ color: "#2d3748", fontWeight: "600" }}>{currentRecord.tasks.length} 個</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 已追蹤任務明細 */}
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "#2d3748", fontWeight: "bold", marginBottom: "15px" }}>已追蹤任務明細</h3>
              <div style={{ minHeight: "120px", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                {currentRecord.tasks.length === 0 ? (
                  <p style={{ color: "#a0aec0", fontSize: "0.95rem", margin: 0 }}>暫無任務摘要</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {currentRecord.tasks.map((task) => (
                      <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #edf2f7" }}>
                        <span style={{ fontWeight: "600", color: "#2d3748", fontSize: "0.95rem" }}>• {task.name}</span>
                        <span style={{ backgroundColor: "#ebf8ff", color: "#2b6cb0", padding: "4px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" }}>{task.progress}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右側：研究時間與計時事項 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "#2d3748", fontWeight: "bold", marginBottom: "20px" }}>研究時間與計時事項</h3>
              <div style={{ backgroundColor: "#f8fafc", padding: "30px 25px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "15px" }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "1.05rem", color: "#4a5568" }}>
                  <span>⏱️</span>
                  <span>今日累計投入時間：</span>
                  <strong style={{ color: "#1a202c", fontSize: "1.2rem" }}>{formatTime(currentRecord.studyTime)}</strong>
                </div>

                <div style={{ display: "flex", alignItems: "start", gap: "10px", fontSize: "1.05rem", color: "#4a5568", borderTop: "1px dashed #e2e8f0", paddingTop: "15px" }}>
                  <span>📌</span>
                  <div style={{ flex: 1 }}>
                    <span>當前追蹤研究主題：</span>
                    <div style={{ marginTop: "6px", color: "#2b6cb0", fontWeight: "bold", fontSize: "1.2rem", backgroundColor: "#ebf8ff", padding: "8px 14px", borderRadius: "8px", inlineSize: "100%", wordBreak: "break-all" }}>
                      {currentRecord.customTitleNote || "未命名研究任務"}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}