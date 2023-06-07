//global id for editing
let editId = undefined;

// first get data from form
let form = document.getElementById("form");

//on dom loaded
window.addEventListener("DOMContentLoaded", (e) => {
  e.preventDefault();
  const { token, membership } = JSON.parse(
    localStorage.getItem("ExpenseTracker")
  );

  const resultLim = JSON.parse(localStorage.getItem("ResultsPerPage")) || 0;
  if (resultLim) document.getElementById("resultLimit").value = resultLim;

  console.log(resultLim);

  console.log(membership);
  if (membership === "premium") {
    setPremiumMode();
  }
  disolayCard("Welcome to Expense tracker ", 2000);

  fetchExpenses(1, resultLim);
});

//On submit
form.addEventListener("submit", (e) => createOrUpdateExpense(e));

// on resultLim change
document.getElementById("resultLimit").addEventListener("change", (e) => {
  e.preventDefault();

  let limit = e.target.value;

  localStorage.setItem("ResultsPerPage", limit);

  console.log(limit);

  fetchExpenses(1, limit);
});

//fetchExpenses
async function fetchExpenses(page = 1, limit) {
  try {
    document.getElementById("listExpense").innerHTML = "";

    const { token, membership } = JSON.parse(
      localStorage.getItem("ExpenseTracker")
    );

    let res = await axios.get(
      `http://localhost:3000/expense?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    console.log(res.data);

    const { hasNextPage, hasPrevPage, nextPg, prevPg, lastPage } = res.data;

    pagination(
      page,
      hasPrevPage,
      hasNextPage,
      prevPg,
      nextPg,
      lastPage,
      "expense-pagination",
      fetchExpenses
    );

    //disolay all exp
    res.data.expenses.map((expense) => {
      showOnscreen(expense);
    });
  } catch (error) {
    console.log(error);
    shoewError(error.response.data.error);
  }
}

// sendData --> post and put
async function createOrUpdateExpense(e) {
  try {
    e.preventDefault();
    console.log("send data");
    let amount = document.getElementById("amount");
    let description = document.getElementById("description");
    let type = document.getElementById("ExpanaseType");

    const { token } = JSON.parse(localStorage.getItem("ExpenseTracker")); // get token

    let expenseObj = {
      expenseAmount: amount.value,
      description: description.value,
      category: type.value,
    };

    if (editId) {
      // console.log(editId);
      //edit // put request

      await axios.put(`http://localhost:3000/expenses/${editId}`, expenseObj);
      fetchExpenses(1);
      editId = undefined;
    } else {
      // try {
      //post
      let response = await axios.post(
        `http://localhost:3000/expense/addExpense`,
        expenseObj,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      //   console.log(response);
      // showOnscreen(response.data.expense);
      fetchExpenses(1);
    }
    amount.value = "";
    description.value = "";
    type.value = "other";
  } catch (error) {
    console.log(error);
    shoewError(error.response.data.error);
  }
}

//show on screen
function showOnscreen(obj) {
  //   console.log(obj);
  let ul = document.getElementById("listExpense");
  let newLi = `<li id="${obj.id}">  
  Expense Type : ${obj.category}   Amount : ${obj.expenseAmount}   Description : ${obj.description} <button onclick="editExp('${obj.id}')">Edit</button><button onclick="delExp('${obj.id}')">Delete</button>
  </li>
  `;

  ul.innerHTML = ul.innerHTML + newLi;
}

//remove from screen
function removeFromScreen(id) {
  document.getElementById(id).remove();
}

// DELETE
async function delExp(id) {
  let { token } = JSON.parse(localStorage.getItem("ExpenseTracker")); // get token
  //delete
  try {
    await axios.delete(
      `http://localhost:3000/expense/delete/${id}`,

      {
        headers: {
          Authorization: token,
        },
      }
    );
    console.log("deleting ");
    removeFromScreen(id);
    alert("Expense Deleted");
  } catch (error) {
    // console.log("delete", error);
    shoewError(error.response.data.error);
  }
}

// EDIT
/*
async function editExp(id) {
  try {
    if (editId) {
      return;
    }

    //get expense
    let expenseObj = await axios.get(`http://localhost:3000/expenses/${id}`);
    console.log(expenseObj);

    //set global edit id
    editId = id;

    //now set data on form
    document.getElementById("amount").value = expenseObj.data.amount;
    document.getElementById("description").value = expenseObj.data.description;
    document.getElementById("ExpanaseType").value = expenseObj.data.type;

    //remove from screen
    removeFromScreen(id);
  } catch (error) {
    console.log("edit function", error);
  }
}
*/

function shoewError(message) {
  let errMsg = document.querySelector(".error-msg ");
  errMsg.classList.remove("hidden");
  errMsg.innerText = message;
  setTimeout(() => {
    errMsg.innerText = "";
    errMsg.classList.add("hidden");
  }, 4000);
}

// payment getway
document.getElementById("rzp-button1").onclick = async function (e) {
  e.preventDefault();
  try {
    const localData = JSON.parse(localStorage.getItem("ExpenseTracker")); // get token
    const { token } = localData;
    // order Id from backend
    const responseFromServer = await axios.post(
      "http://localhost:3000/payment/create/orderId",
      {
        amount: 500, // pass in rs --> backend will handle rest
      },

      {
        headers: {
          Authorization: token,
        },
      }
    );

    const { orderId, amount, currency, receipt } = responseFromServer.data;
    // options
    let options = {
      key: "rzp_test_bnWvn8yH1pEuty", // Enter the Key ID generated from the Dashboard
      amount,
      currency,
      name: "Acme Corp",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: function (response) {
        console.log(response);

        axios
          .post(
            "http://localhost:3000/payment/verify",
            { ...response, receipt },
            {
              headers: {
                Authorization: token,
              },
            }
          )
          .then((data) => {
            console.log("verified ==> ", data.data);
            // set primium mode
            console.log("verified  local data==> ", {});

            let newLocalData = { ...localData, membership: "premium" };

            localStorage.setItem(
              "ExpenseTracker",
              JSON.stringify(newLocalData)
            );
            setPremiumMode();
            disolayCard("now You Are Premium Member", 3000);
          })
          .catch((er) => console.log(er));
      },
      prefill: {
        name: "Tony Stark",
        email: "IronMan@A.com",
        contact: "9999999999",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        backgroundColor: "#ffadad",
        color: "#1d1828",
      },
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();

    rzp1.on("payment.failed", function (response) {
      console.log(response);
    });
  } catch (error) {
    console.log(error);
  }
};

function setPremiumMode() {
  document.getElementById("rzp-button1").remove();
  let toggleBox = document.querySelector(".toggle-wrap");
  toggleBox.classList.remove("hidden");

  let leaderboardBtn = document.getElementById("leaderboard");

  leaderboardBtn.classList.remove("hidden");
  leaderboardBtn.style.display = "block";

  leaderboardBtn.removeAttribute("disabled");
}

function disolayCard(message, timeout) {
  let div = document.getElementById("popupCard");
  console.log(message);

  div.innerHTML = `<p>${message}</p>`;

  div.classList.remove("hidden");
  div.classList.add("flex-center");

  setTimeout(() => {
    div.innerHTML = "";

    div.classList.add("hidden");
    div.classList.remove("flex-center");
  }, timeout);
}

//handle pagingion
function pagination(
  currPg,
  hasPrev,
  hasNext,
  prevPg,
  nextPg,
  lastPage,
  paginationLocID,
  cb
) {
  let paginationBox = document.getElementById(`${paginationLocID}`);
  paginationBox.innerHTML = "";

  let currBtn, nextBtn, prevBtn, lastBtn, firstBtn;
  if (hasPrev) {
    prevBtn = document.createElement("button");
    prevBtn.className = "pagi-btn prevPg";

    prevBtn.innerText = prevPg;
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cb(prevPg);
    });

    //if previous exist then first page is also avail
    firstBtn = document.createElement("button");
    firstBtn.className = "pagi-btn";
    firstBtn.innerText = "<<";
    firstBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cb(1);
    });

    paginationBox.appendChild(firstBtn);
    paginationBox.appendChild(prevBtn);
  }

  if (currPg) {
    currBtn = document.createElement("button");
    currBtn.className = "pagi-btn currentPg";

    currBtn.innerText = currPg;

    paginationBox.appendChild(currBtn);
  }
  if (hasNext) {
    nextBtn = document.createElement("button");
    nextBtn.className = "pagi-btn nextPg";

    nextBtn.innerText = nextPg;
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cb(nextPg);
    });

    //if next exist then last page is also avail
    lastBtn = document.createElement("button");
    lastBtn.className = "pagi-btn";
    lastBtn.innerText = ">>";
    lastBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cb(lastPage);
    });

    paginationBox.appendChild(nextBtn);
    paginationBox.appendChild(lastBtn);
  }
}