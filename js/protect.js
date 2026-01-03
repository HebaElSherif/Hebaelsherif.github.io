// حماية "خفيفة" على الويب: لا تمنع screenshot 100% لكنها تقلل النسخ والتسريب

export function enableBasicProtection() {
  // منع كليك يمين
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // منع copy/cut/paste
  ["copy", "cut", "paste"].forEach((evt) =>
    document.addEventListener(evt, (e) => e.preventDefault())
  );

  // منع تحديد النص (قد ترغب بإزالته من صفحات المدونة لاحقًا)
  document.documentElement.style.webkitUserSelect = "none";
  document.documentElement.style.userSelect = "none";

  // blur عند تغيير التبويب/الخروج
  document.addEventListener("visibilitychange", () => {
    document.body.style.filter = document.hidden ? "blur(14px)" : "none";
  });
}

export function addWatermark(text) {
  const wm = document.createElement("div");
  wm.className = "watermark";

  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 220;

  const ctx = canvas.getContext("2d");
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0B0B0F";
  ctx.fillText(text, 20, 60);
  ctx.fillText(new Date().toLocaleString(), 20, 90);
  ctx.fillText("Heba ElSherif Academy", 20, 130);

  wm.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
  document.body.appendChild(wm);
}
