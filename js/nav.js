let { membership } = JSON.parse(localStorage.getItem("ExpenseTracker"));

document.getElementById("leaderboard").addEventListener("click", (e) => {
  e.preventDefault();

  if (membership == "free") {
    console.log(membership);
    alert("To use this feature buy premium membership");
    window.location.href = "/expenses/expenses.html";
  } else {
    window.location = "leaderboard.html";
  }
});

const darkToggle = document.getElementById("toggle");

darkToggle.addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
});

// "/userReportPg/expReport.html"
document.getElementById("exp-report-btn").addEventListener("click", (e) => {
  if (membership == "free") {
    console.log(membership);
    alert("To use this feature buy premium membership");
    window.location.href = "/expenses/expenses.html";
  } else {
    window.location.href = "/userReportPg/expReport.html";
  }
});