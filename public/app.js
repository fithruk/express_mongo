window.addEventListener("DOMContentLoaded", () => {
  const toCurrency = (price) => {
    return new Intl.NumberFormat("en-En", {
      currency: "UAH",
      style: "currency",
    }).format(price);
  };

  document.querySelectorAll(".price").forEach((node) => {
    node.textContent = toCurrency(node.textContent);
  });
  const message = document.querySelector(".message");

  const $card = document.querySelector("#card");
  if ($card) {
    $card.addEventListener("click", (event) => {
      if (event.target.classList.contains("js-remove")) {
        const id = event.target.dataset.id;

        fetch("/card/remove/" + id, {
          method: "delete",
        })
          .then((res) => res.json())
          .then((card) => {
            if (card.courses.length) {
              const html = card.courses
                .map((c) => {
                  return `
                <tr>
                  <td>${c.title}</td>
                  <td>${c.count}</td>
                  <td>
                    <button class="btn btm-small js-remove" data-id="${c.id}">Удалить</button>
                  </td>
                </tr>
                `;
                })
                .join("");
              $card.querySelector("tbody").innerHTML = html;
              const total = card.courses.reduce((acc, course) => {
                return acc + course.price * course.count;
              }, 0);

              $card.querySelector(".price").textContent = toCurrency(total);
            } else {
              $card.innerHTML = "<p>Card is empty</p>";
            }
          });
      }
    });
  }

  M.Tabs.init(document.querySelectorAll(".tabs"));

  if (message) {
    const msg =
      "Pet project written using expressJS technology and handlebars html engine. Implemented the functions of registration, authorization, adding and deleting courses, as well as password recovery via email. It is possible to add an item to the cart, remove it from the cart and place an order, having received your personal selection of orders. Used mongo db database";
    let writeMachine = "";
    let i = 0;
    const interval = setInterval(() => {
      writeMachine = writeMachine + msg[i];
      message.textContent = writeMachine;
      i++;
      if (i === msg.length) {
        clearInterval(interval);
      }
    }, 100);
  }
});
