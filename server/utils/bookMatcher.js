function calculateScore(book, userInput) {
    let score = 0;
  
    const inputWords = [
      userInput.field,
      userInput.year,
      ...(userInput.interests ? userInput.interests.split(" ") : [])
    ].filter(word => word && word.trim() !== "");
  
    inputWords.forEach(word => {
      if (book.keywords.toLowerCase().includes(word.toLowerCase())) {
        score += 1;
      }
    });
  
    return score;
  }
  
  module.exports = calculateScore;
  