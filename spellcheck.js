/* 

This js script calculates the sequence table for any words inserted into the field text in spellchecker.html, the nice thing about this implementation with js
is that as a user types in their word, the table will adapt for every character typed into the search bar. This particular spellchecker uses the Levenshtein distance algorithm
to calculate the discrepancies between what has been currently typed in the text field and compared to the entire dictionary. 

Although the Levenshtein algorithm is still O(mn), since the input is being compared to an entire array of words to spellcheck against, the overall time of this application
is running at O(d*m*n) where d is the length of the dictionary array.

*/


// Initialization of dictionary
let dictionary = [];

// Function to load the dictionary from a text file
async function loadDictionary() {
    try {
        const response = await fetch('dictionary.txt');
        const text = await response.text();
        dictionary = text.split('\n').map(word => word.trim()); // Inserts words from dictionary into dictionary[]
    }
    //Debugging dictionary pathing and storing
    catch (error) {
        console.error("Error loading dictionary:", error);
    }
}

// Vowel checker for consonant and vowel discrepancies
function isVowel(char) {
    return "aeiouAEIOU".includes(char);
}



// Sequence Alignment algorithm, specifically levenshtein for this application s1 is the input word, s2 goes through each word in the dictionary
function sequenceTable(s1, s2) {
    const m = s1.length, n = s2.length;
    // 2D array creation
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Initialize the sequence table
    for (let i = 0; i <= m; i++) dp[i][0] = i * 2;  // Cost of inserting gaps (deletion)
    for (let j = 0; j <= n; j++) dp[0][j] = j * 2;  // Cost of inserting gaps (insertion)

    // Calculate penalties
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            let cost = 0;
            // Checks each letter in each word
            const char1 = s1[i - 1];
            const char2 = s2[j - 1];

            if (char1 === char2) {
                cost = 0; // Exact match: no penalty
            } else if (isVowel(char1) && isVowel(char2)) {
                cost = 1; // Vowel/Vowel mismatch: penalty of 1
            } else if (!isVowel(char1) && !isVowel(char2)) {
                cost = 1; // Consonant/Consonant mismatch: penalty of 1
            } else {
                cost = 3; // Vowel/Consonant mismatch: penalty of 3
            }

            //finds the minimum value between both types of gaps, or the type of discrepancy (or none if perfect match)
            dp[i][j] = Math.min(
                dp[i - 1][j] + 2,  // Gap (deletion)
                dp[i][j - 1] + 2,  // Gap (insertion)
                dp[i - 1][j - 1] + cost // Substitution
            );
        }
    }

    return dp[m][n]; // Return the final distance
}


// Function to get the closest suggestions
function getSuggestions(input) {
    if (!input) return [];
    const distances = dictionary.map(word => ({
        word,
        distance: sequenceTable(input, word)
    }));
    return distances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10) // Top 10 suggestions
        .map(item => item.word);
}

// UI update for spellchecker.html, makes a list below the text field to show 10 closest suggestions
document.getElementById("wordInput").addEventListener("input", (e) => {
    const input = e.target.value;
    const suggestions = getSuggestions(input);

    const suggestionList = document.getElementById("suggestions");
    suggestionList.innerHTML = ""; // Clear old suggestions

    suggestions.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word;
        li.addEventListener("click", () => {
            document.getElementById("wordInput").value = word;
            suggestionList.innerHTML = ""; // Clear suggestions
        });
        suggestionList.appendChild(li);
    });
});

// Load the dictionary when the page loads
window.addEventListener('DOMContentLoaded', loadDictionary);
