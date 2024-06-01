exports.createMessage = (content, userId) => {
  const date = new Date();
  const utc8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000); // Convert to UTC+8

  // const formattedDate = utc8Date.toISOString().replace('T', ' ').substr(0, 19); // Format date
  // Format date to "MM-DD HH:MM:SS"
  const formattedDate = utc8Date
    .toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    //   second: "2-digit",
      hour12: false, // 24-hour format
    })
    .replace(/\//g, "-")
    .replace(",", "");

  return {
    userId: userId,
    content: content,
    timestamp: formattedDate,
  };
};
