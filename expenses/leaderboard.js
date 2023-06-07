window.addEventListener("DOMContentLoaded", (e) => {
    // fetch data from backend
    const { token } = JSON.parse(localStorage.getItem("ExpenseTracker"));
    getleaderBoard(token);
  });
  
  async function getleaderBoard(token) {
    try {
      let usersInLeaderboard = await axios.get(
        "http://localhost:3000/leaderboard/showAll",
        {
          headers: {
            Authorization: token,
          },
        }
      );
  
      // displaying each
      // console.log(usersInLeaderboard);
  
      let list = document.getElementById("leaderboard-list");
  
      list.innerHTML = "";
      const { leaderboard, requestUserId } = usersInLeaderboard.data;
  
      for (let i = 0; i < leaderboard.length; i++) {
        console.log(leaderboard[i]);
        let isCurrUser = false;
        const { userName, userId, totalExpenses } = leaderboard[i];
        if (requestUserId == userId) isCurrUser = true;
  
        createUserInLeaderBoard(
          i + 1,
          userName,
          totalExpenses,
          userId,
          isCurrUser
        );
      }
    } catch (error) {
      console.log("\n error in getleaderbord ==>", error);
    }
  }
  
  function createUserInLeaderBoard(rank, name, totalExp, id, isCurrUser = false) {
    //   console.log(rank, name, totalExp, id, isCurrUser);
    let li = document.createElement("li");
  
    li.id = `u${id}`;
  
    if (isCurrUser) li.classList.add("highlight");
  
    li.innerHTML = `
      <span class="rank"> rank = ${rank} </span>
      <span class="name"> name = ${name} </span>
      <span class="exp"> exp = ${totalExp} </span>
      <button onclick="fetchUser(${id})"> more </button>
    `;
  
    let list = document.getElementById("leaderboard-list");
  
    list.appendChild(li);
  }
  
  async function fetchUser(userId) {
    try {
      const { token } = JSON.parse(localStorage.getItem("ExpenseTracker"));
      let response = await axios.post(
        "http://localhost:3000/leaderboard/showUser",
  
        { userId },
        {
          headers: {
            Authorization: token,
          },
        }
      );
  
      console.log(response);
  
      let expenseArr = response.data.usersExp;
      let userExpenseBox = document.getElementById("user-expense");
  
      userExpenseBox.classList.remove("hidden");
  
      document.querySelector(
        "#user-expense h2"
      ).innerText = `Expenses of user with id UUId-${userId}`;
  
      let list = document.getElementById("exp-list");
      list.innerHTML = "";
      expenseArr.map((obj) => {
        console.log(obj);
        const { expenseAmount, category, description } = obj;
        showUserExpense(category, expenseAmount, description);
      });
    } catch (error) {
      console.log(error);
    }
  }
  
  function showUserExpense(category, amount, desc) {
    let li = document.createElement("li");
  
    li.innerHTML = `
      <span > category = ${category} </span>
      <span > amount = ${amount} </span>
      <span > desc = ${desc} </span>
      
    `;
  
    let list = document.getElementById("exp-list");
  
    list.appendChild(li);
  }
  
  document.querySelector(".cancel-top").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("user-expense").classList.add("hidden");
  });