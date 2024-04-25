import { gsap } from "gsap";

class Main {
  constructor() {
    this.main = document.querySelector("#main");
    this.rowRefs = [];
    this.colRefs = [];
    // if not standard size, use percentage width instead to handle wider screen
    this.standardWidth = this.isStandardSize() ? 240 : window.innerWidth / 7.5;
    this.standardHeight = this.standardWidth;
    this.containerWidth = this.standardWidth * itemsPerRow;
    this.containerHeight = this.standardHeight * itemsPerCol;
    this.triggerPointY = (this.containerHeight - window.innerHeight) / 2;
    this.triggerPointX = (this.containerWidth - window.innerWidth) / 2;
    this.lastMainScrollY = 0;
    this.lastMainScrollX = 0;
    this.scrollSpeed = 0.25;
  }

  isStandardSize() {
    const x = window.matchMedia("(max-width: 1680px)");
    return x.matches;
  }

  centerContainer() {
    this.main.style.width = this.containerWidth + "px";
    this.main.style.height = this.containerHeight + "px";
    this.main.style.left = "50%";
    this.main.style.top = "50%";
    this.main.style.transform = "translate(-50%, -50%)";
  }

  createGridLayout(row, col, totalRows, totalCols, imageUrls) {
    const currentImg = imageUrls[`row${row}col${col}`];
    // Base case: If we have created all the divs, return
    if (row > totalRows) {
      return;
    }
    const div = document.createElement("div");
    div.className = `row-${row} col-${col}`;
    div.style.width = this.standardWidth + "px";
    div.style.top = this.standardHeight * (row - 1) + "px";
    div.style.left = this.standardWidth * (col - 1) + "px";
    if (row === 1) {
      div.dataset.col = `col-${col}`;
      this.colRefs.push(div);
    }
    if (col === 1) {
      div.dataset.row = `row-${row}`;
      this.rowRefs.push(div);
    }

    if (typeof currentImg !== "object") {
      const img = document.createElement("img");
      img.src = "/images/" + currentImg;

      // Append the img to the div
      div.appendChild(img);
      const aside = document.createElement("aside");
      const span1 = document.createElement("span");
      const span2 = document.createElement("span");
      span1.innerHTML = `Brand Adventure ${row}-${col}`;
      span2.innerHTML = "Smile | Flame";
      aside.appendChild(span1);
      aside.appendChild(span2);
      div.appendChild(aside);
    } else {
      const img = document.createElement("img");
      img.src = "/images/" + currentImg.src;
      // Append the img to the div
      div.appendChild(img);
    }

    // Append the div to the body or any other container element
    this.main.appendChild(div);

    // Recursive call to create the next div
    if (col < totalCols) {
      this.createGridLayout(row, col + 1, totalRows, totalCols, imageUrls);
    } else {
      this.createGridLayout(row + 1, 1, totalRows, totalCols, imageUrls);
    }
  }

  setupTwoFingersPan() {
    // setup 2 fingers pan here.
    const onScroll = (e) => {
      e.preventDefault();
      const translateX = this.convertMatrixToValue(4); // get translateX
      const translateY = this.convertMatrixToValue(5); // get translateY
      gsap.set(this.main, {
        x: translateX - e.deltaX * this.scrollSpeed,
        y: translateY - e.deltaY * this.scrollSpeed,
        xPercent: 0,
        yPercent: 0,
        ease: "Power3.easeOut",
      });
      //setStyleInt(this.main, "top", currentY - e.deltaY * this.scrollSpeed);
      this.moveElementsByScrollDir(
        this.lastMainScrollY,
        gsap.getProperty(this.main, "y"),
        this.lastMainScrollX,
        gsap.getProperty(this.main, "x")
      );
      // update lastMainScrollY here.
      this.lastMainScrollY = gsap.getProperty(this.main, "y");
      this.lastMainScrollX = gsap.getProperty(this.main, "x");
    };
    window.addEventListener("wheel", onScroll, { passive: false });
    return () => window.removeEventListener("wheel", onScroll);
  }

  moveElementsByScrollDir(lastY, currentY, lastX, currentX) {
    // +=0/containerHeight, 然後開始計算整整滑了一個container width才算倍數1
    const multipleScrollY = Math.floor(
      (this.main.getBoundingClientRect().y + this.triggerPointY) /
        this.containerHeight
    );
    const multipleScrollX = Math.floor(
      (this.main.getBoundingClientRect().x + this.triggerPointX) /
        this.containerWidth
    );
    this.getScrollDirY(lastY, currentY) === "down"
      ? this.moveElementsToBottom(multipleScrollY)
      : this.moveElementsToTop(multipleScrollY);

    this.getScrollDirX(lastX, currentX) === "left"
      ? this.moveElementsToRight(multipleScrollX)
      : this.moveElementsToLeft(multipleScrollX);
  }

  moveElementsToBottom(ratio) {
    // easier here if we reverse the object, since the last block always get trigger first
    this.rowRefs.forEach((rowRef, i) => {
      if (rowRef.getBoundingClientRect().y < -this.triggerPointY) {
        const row = rowRef.getAttribute("data-row");
        const selected = document.querySelectorAll(`.${row}`);
        const temp = this.standardHeight * i;
        selected.forEach((item) => {
          gsap.set(item, {
            top: this.containerHeight * -ratio + temp,
          });
        });
      }
    });
  }

  moveElementsToTop(ratio) {
    this.rowRefs
      .slice()
      .reverse()
      .forEach((rowRef, i) => {
        if (
          // we add 240px here because of the getBoundingClientRect is on the left side
          rowRef.getBoundingClientRect().y + this.standardHeight >
          this.triggerPointY + window.innerHeight
        ) {
          const row = rowRef.getAttribute("data-row");
          const selected = document.querySelectorAll(`.${row}`);
          const temp = this.standardHeight * (i + 1);
          selected.forEach((item) => {
            gsap.set(item, {
              top: this.containerHeight * -ratio - temp,
            });
          });
        }
      });
  }

  moveElementsToRight(ratio) {
    // easier here if we reverse the object, since the last block always get trigger first
    this.colRefs.forEach((key, i) => {
      if (this.colRefs[i].getBoundingClientRect().x < -this.triggerPointX) {
        const col = this.colRefs[i].getAttribute("data-col");
        const selected = document.querySelectorAll(`.${col}`);
        const temp = this.standardWidth * i;
        selected.forEach((item) => {
          gsap.set(item, {
            left: this.containerWidth * -ratio + temp,
          });
        });
      }
    });
  }

  moveElementsToLeft(ratio) {
    this.colRefs
      .slice()
      .reverse()
      .forEach((colRef, i) => {
        if (
          colRef.getBoundingClientRect().x + this.standardWidth >
          this.triggerPointX + window.innerWidth
        ) {
          const col = colRef.getAttribute("data-col");
          const selected = document.querySelectorAll(`.${col}`);
          const temp = this.standardWidth * (i + 1);
          selected.forEach((item) => {
            gsap.set(item, {
              left: this.containerWidth * -ratio - temp,
            });
          });
        }
      });
  }

  convertMatrixToValue(index) {
    const transformMatrix = window
      .getComputedStyle(this.main)
      .getPropertyValue("transform");
    //matrix(1, 0, 0, 1, -1194.5, -1135)
    const matrixValues = transformMatrix
      .match(/matrix\((.+)\)/)[1]
      .split(",")
      .map(parseFloat);
    return matrixValues[index];
  }

  getScrollDirX(lastX, currentX) {
    const dirX = currentX > lastX ? "right" : "left";
    return dirX;
  }

  getScrollDirY(lastY, currentY) {
    const dirY = currentY > lastY ? "up" : "down";
    return dirY;
  }
}

const itemsPerCol = 10;
const itemsPerRow = 10;
const main = new Main();
main.centerContainer();
// Load JSON file with image URLs
fetch("data.json")
  .then((response) => response.json())
  .then((imageUrls) => {
    // Start the recursion with initial parameters and loaded image URLs
    main.createGridLayout(1, 1, 10, 10, imageUrls);
  })
  .catch((error) => {
    console.error("Failed to load image URLs:", error);
  });
main.setupTwoFingersPan();
