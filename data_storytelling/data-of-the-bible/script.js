const books = [
  { name: "Genesis", chapters: 50, words: 38519, letters: 151837 },
  { name: "Exodus", chapters: 40, words: 32767, letters: 131762 },
  { name: "Leviticus", chapters: 27, words: 24621, letters: 98916 },
  { name: "Numbers", chapters: 36, words: 33765, letters: 140862 },
  { name: "Deuteronomy", chapters: 34, words: 28402, letters: 113984 },
  { name: "Joshua", chapters: 24, words: 18866, letters: 78362 },
  { name: "Judges", chapters: 21, words: 19006, letters: 76834 },
  { name: "Ruth", chapters: 4, words: 2583, letters: 9999 },
  { name: "1 Samuel", chapters: 31, words: 25145, letters: 100193 },
  { name: "2 Samuel", chapters: 24, words: 20538, letters: 81743 },
  { name: "1 Kings", chapters: 22, words: 24588, letters: 98689 },
  { name: "2 Kings", words: 23590, letters: 93614 },
  { name: "1 Chronicles", chapters: 29, words: 20414, letters: 86607 },
  { name: "2 Chronicles", chapters: 36, words: 26123, letters: 109279 },
  { name: "Ezra", chapters: 10, words: 7453, letters: 31701 },
  { name: "Nehemiah", chapters: 13, words: 10497, letters: 44697 },
  { name: "Esther", chapters: 10, words: 5712, letters: 23726 },
  { name: "Job", chapters: 42, words: 18098, letters: 73131 },
  { name: "Psalms", chapters: 150, words: 42731, letters: 173920 },
  { name: "Proverbs", chapters: 31, words: 14668, letters: 60881 },
  { name: "Ecclesiastes", chapters: 12, words: 5590, letters: 21968 },
  { name: "Song of Solomon", chapters: 8, words: 2668, letters: 10540 },
  { name: "Isaiah", chapters: 66, words: 37333, letters: 152015 },
  { name: "Jeremiah", chapters: 52, words: 42729, letters: 174337 },
  { name: "Lamentations", chapters: 5, words: 3413, letters: 14165 },
  { name: "Ezekiel", chapters: 48, words: 40102, letters: 162635 },
  { name: "Daniel", chapters: 12, words: 11631, letters: 48443 },
  { name: "Hosea", chapters: 14, words: 5175, letters: 21119 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21, words: 21440, letters: 84858 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

function openModal(book, chapters, words, letters) {
  document.getElementById("bookName").innerText = book;
  document.getElementById("chapterCount").innerText = chapters + " Chapters";
  document.getElementById("bookWords").innerText = `Words: ${Number(
    words
  ).toLocaleString()}`;
  document.getElementById("bookLetters").innerText = `Letters: ${Number(
    letters
  ).toLocaleString()}`;
  document.getElementById("myModal").style.display = "block";
}

function closeModal() {
  document.getElementById("myModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("myModal");
  if (event.target == modal) modal.style.display = "none";
};

function showGrid() {
  const display = document.getElementById("display");
  display.className = "grid";
  display.innerHTML = books
    .map(
      (book) =>
        `<div onclick="openModal('${book.name}', ${book.chapters}, ${book.words}, ${book.letters})">${book.name}</div>`
    )
    .join("");
  document.getElementById("gridBtn").classList.add("active");
  document.getElementById("listBtn").classList.remove("active");
  document.getElementById("textBtn").classList.remove("active");
}

function showList() {
  const display = document.getElementById("display");
  display.className = "list";
  display.innerHTML = books
    .map(
      (book) =>
        `<div onclick="openModal('${book.name}', ${book.chapters}, ${book.words}, ${book.letters})")"><span class='book-name'>${book.name}</span><span class='chapter-count'>${book.chapters} Chapters</span></div>`
    )
    .join("");
  document.getElementById("listBtn").classList.add("active");
  document.getElementById("gridBtn").classList.remove("active");
  document.getElementById("textBtn").classList.remove("active");
  document.getElementById("threeCloud").style.display = "none";
}

function showText() {
  const display = document.getElementById("display");
  display.className = "text";
  display.innerHTML = "";
  fetch("bible_text.txt") // relative path, same folder as index.html
    .then((response) => response.text())
    .then((data) => {
      display.innerHTML = `
        <div id="wordDisplay" style="
          width: 80%;
          margin: 20px auto;
          font-family: sans-serif;
          font-size: 0.5rem;
          white-space: pre-wrap;
        ">${data}</div>`;
    });
  document.getElementById("textBtn").classList.add("active");
  document.getElementById("listBtn").classList.remove("active");
  document.getElementById("gridBtn").classList.remove("active");
  document.getElementById("threeCloud").style.display = "none";
}

showGrid(); // default start
