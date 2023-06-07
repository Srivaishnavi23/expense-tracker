document.getElementById("rzp-button1").onclick = async function (e) {
    e.preventDefault();
    try {
      const { token } = JSON.parse(localStorage.getItem("ExpenseTracker")); // get token
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
  
      const { orderId, amount, currency } = responseFromServer.data;
  
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
            .post("http://localhost:3000/payment/verify", response, {
              headers: {
                Authorization: token,
              },
            })
            .then(() => {
              // set primium mode
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