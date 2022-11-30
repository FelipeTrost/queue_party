// uses the best option for sharing available to the browser
export function roomLink(roomId) {
  return `${import.meta.env.VITE_APP_PUBLIC_URL}/room/${roomId}`;
}

export function share(roomId, errorDispatcher) {
  const link = roomLink(roomId);

  if (navigator.share) {
    navigator.share({
      title: "Queue Party",
      text: `Join room ${roomId} and add music to the queue`,
      url: link,
    });
  } else {
    navigator.clipboard
      .writeText(link)
      .then(() => errorDispatcher("Copied room link to clipboard", true))
      .catch(() => errorDispatcher("Failed to copy room link to clipboard"));
  }
}
