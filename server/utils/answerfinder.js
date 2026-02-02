function findAnswer(bookText, question) {
    // Split book content into sentences
    const sentences = bookText.split(".");
  
    // Extract keywords from question
    const keywords = question
      .toLowerCase()
      .split(" ")
      .filter(word => word.length > 2);
  
    let bestMatch = null;
    let maxScore = 0;
  
    // Compare each sentence with question keywords
    sentences.forEach(sentence => {
      let score = 0;
      keywords.forEach(word => {
        if (sentence.toLowerCase().includes(word)) {
          score++;
        }
      });
  
      if (score > maxScore) {
        maxScore = score;
        bestMatch = sentence;
      }
    });
  
    // If no meaningful match found
    if (maxScore < 2) {
      return null;
    }
  
    return bestMatch.trim() + ".";
  }
  
  module.exports = findAnswer;
  