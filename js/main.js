(function () {
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav");

  function closeNav() {
    if (!burger || !nav) return;
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-lock");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-lock", open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  document.documentElement.classList.add("js");
  var nodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (node) { io.observe(node); });
  } else {
    nodes.forEach(function (node) { node.classList.add("is-visible"); });
  }

  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var box = document.getElementById("lightbox");
  var photo = document.getElementById("lightbox-img");
  var caption = document.getElementById("lightbox-cap");
  var current = 0;

  function openAt(index) {
    current = (index + shots.length) % shots.length;
    var shot = shots[current];
    var source = shot.querySelector("img");
    photo.src = source.getAttribute("src").replace("w=1200", "w=1800");
    photo.alt = source.alt;
    caption.textContent = shot.getAttribute("data-caption") || "";
    box.hidden = false;
    document.body.classList.add("nav-lock");
    box.querySelector(".lightbox-close").focus();
  }

  function closeBox() {
    box.hidden = true;
    photo.removeAttribute("src");
    document.body.classList.remove("nav-lock");
  }

  shots.forEach(function (shot, index) {
    shot.addEventListener("click", function () { openAt(index); });
  });
  box.querySelector(".lightbox-close").addEventListener("click", closeBox);
  box.querySelector(".lightbox-prev").addEventListener("click", function () { openAt(current - 1); });
  box.querySelector(".lightbox-next").addEventListener("click", function () { openAt(current + 1); });
  box.addEventListener("click", function (event) {
    if (event.target === box) closeBox();
  });
  document.addEventListener("keydown", function (event) {
    if (box.hidden) return;
    if (event.key === "Escape") closeBox();
    if (event.key === "ArrowRight") openAt(current + 1);
    if (event.key === "ArrowLeft") openAt(current - 1);
    if (event.key === "Tab") {
      var focusable = Array.prototype.slice.call(box.querySelectorAll("button"));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  var rates = { cosmetic: 9500, capital: 18500, design: 32000 };
  var names = {
    cosmetic: "Косметический ремонт",
    capital: "Капитальный ремонт",
    design: "Дизайнерский ремонт"
  };
  var areaInput = document.getElementById("area");
  var areaRange = document.getElementById("area-range");
  var sumEl = document.getElementById("sheet-sum");
  var rangeEl = document.getElementById("sheet-range");
  var linesEl = document.getElementById("sheet-lines");

  function money(value) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
  }

  function readArea() {
    var value = Number(areaInput.value);
    if (!value || value < 20) return 20;
    if (value > 180) return 180;
    return value;
  }

  function renderCalc() {
    var area = readArea();
    if (document.activeElement !== areaInput) areaInput.value = String(area);
    areaRange.value = String(area);
    var kind = document.querySelector('input[name="kind"]:checked').value;
    var base = rates[kind] * area;
    var lines = [{ label: names[kind], value: base }];
    var total = base;
    if (document.getElementById("electric").checked) {
      var electric = 1800 * area;
      lines.push({ label: "Электрика", value: electric });
      total += electric;
    }
    if (document.getElementById("plumbing").checked) {
      var plumbing = 2200 * area;
      lines.push({ label: "Сантехника", value: plumbing });
      total += plumbing;
    }
    if (document.getElementById("floorheat").checked) {
      var heat = 950 * area;
      lines.push({ label: "Тёплый пол", value: heat });
      total += heat;
    }
    if (document.getElementById("materials").checked) {
      var materials = total * 0.15;
      lines.push({ label: "Черновые материалы", value: materials });
      total += materials;
    }
    var low = Math.round(total * 0.9 / 1000) * 1000;
    var high = Math.round(total * 1.12 / 1000) * 1000;
    sumEl.textContent = money(total);
    rangeEl.textContent = "Вилка " + money(low) + " — " + money(high) + " при площади " + area + " м².";
    linesEl.innerHTML = "";
    lines.forEach(function (line) {
      var item = document.createElement("li");
      var title = document.createElement("span");
      var price = document.createElement("strong");
      title.textContent = line.label;
      price.textContent = money(line.value);
      item.appendChild(title);
      item.appendChild(price);
      linesEl.appendChild(item);
    });
  }

  areaRange.addEventListener("input", function () {
    areaInput.value = areaRange.value;
    renderCalc();
  });
  areaInput.addEventListener("input", renderCalc);
  areaInput.addEventListener("blur", function () {
    areaInput.value = String(readArea());
    renderCalc();
  });
  document.getElementById("calc-form").addEventListener("input", renderCalc);
  document.getElementById("calc-form").addEventListener("submit", function (event) {
    event.preventDefault();
    renderCalc();
  });
  renderCalc();

  function digits(value) { return value.replace(/\D/g, ""); }
  function validPhone(value) {
    var d = digits(value);
    if (d.length === 11) return d.charAt(0) === "7" || d.charAt(0) === "8";
    return d.length === 10;
  }
  function validName(value) {
    return /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\-\s]{1,}$/.test(value.trim());
  }
  function setError(id, message) {
    var error = document.getElementById(id + "-error");
    var field = document.getElementById(id);
    if (error) error.textContent = message;
    if (field) field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  var lead = document.getElementById("lead-form");
  ["name", "phone", "object", "lead-area"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () { setError(id, ""); });
  });
  lead.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("name").value;
    var phone = document.getElementById("phone").value;
    var objectType = document.getElementById("object").value;
    var area = Number(document.getElementById("lead-area").value);
    var ok = true;
    if (!validName(name)) { setError("name", "Напишите имя."); ok = false; } else setError("name", "");
    if (!validPhone(phone)) { setError("phone", "Телефон: +7 или 8 и десять цифр."); ok = false; } else setError("phone", "");
    if (!objectType) { setError("object", "Выберите тип объекта."); ok = false; } else setError("object", "");
    if (!area || area < 15 || area > 500) {
      setError("lead-area", "Площадь от 15 до 500 м².");
      ok = false;
    } else setError("lead-area", "");
    if (!ok) return;
    document.getElementById("lead-fields").hidden = true;
    var success = document.getElementById("lead-success");
    success.hidden = false;
    success.textContent = name.trim() + ", заявка на замер принята: " + objectType.toLowerCase() + ", " + area + " м². Это демонстрация — номер " + phone.trim() + " никуда не отправляется. В рабочей версии инженер перезвонил бы в тот же день.";
    success.focus();
  });
})();
