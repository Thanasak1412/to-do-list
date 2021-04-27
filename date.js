exports.getDate = () => {
  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  // return `${today.toLocaleDateString("TH-th", options)}`;
    return `${today.toLocaleDateString("TH-th", options)} ${today.toLocaleTimeString("TH-th")}`;
}