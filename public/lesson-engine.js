const lessonContainer = document.getElementById('lesson-container');
const lesson = lessonData.cards;
let currentCard = 0;
let score = 0;

function buildCard(card) {
    lessonContainer.innerHTML = ''; // Clear previous card
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card-content');

    if (card.type === 'briefing') {
        const content = document.createElement('p');
        content.innerHTML = card.content; // Use innerHTML to render formatting
        cardDiv.appendChild(content);
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Start Lesson';
        nextButton.onclick = () => showNextCard();
        cardDiv.appendChild(nextButton);
    } else if (card.type === 'mc') {
        const question = document.createElement('p');
        question.textContent = card.question;
        cardDiv.appendChild(question);
        
        const choicesDiv = document.createElement('div');
        choicesDiv.classList.add('choices');
        card.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.onclick = () => checkAnswer(choice, card.answer, cardDiv);
            choicesDiv.appendChild(button);
        });
        cardDiv.appendChild(choicesDiv);
    } else if (card.type === 'scrambled') {
        const instructions = document.createElement('p');
        instructions.textContent = card.instructions;
        cardDiv.appendChild(instructions);

        const sentencesDiv = document.createElement('div');
        sentencesDiv.id = 'scrambled-sentences';
        sentencesDiv.classList.add('scrambled-container');

        const scrambledSentences = [...card.sentences];
        // Simple shuffle
        for (let i = scrambledSentences.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [scrambledSentences[i], scrambledSentences[j]] = [scrambledSentences[j], scrambledSentences[i]];
        }

        scrambledSentences.forEach((sentence, index) => {
            const sentenceDiv = document.createElement('div');
            sentenceDiv.textContent = sentence;
            sentenceDiv.draggable = true;
            sentenceDiv.id = `sentence-${index}`;
            sentenceDiv.classList.add('scrambled-item');
            sentenceDiv.addEventListener('dragstart', handleDragStart);
            sentenceDiv.addEventListener('dragover', handleDragOver);
            sentenceDiv.addEventListener('drop', handleDrop);
            sentenceDiv.addEventListener('dragend', handleDragEnd);
            sentencesDiv.appendChild(sentenceDiv);
        });
        cardDiv.appendChild(sentencesDiv);

        const checkButton = document.createElement('button');
        checkButton.textContent = 'Check Order';
        checkButton.onclick = () => checkScrambledAnswer(card.sentences);
        cardDiv.appendChild(checkButton);
    }

    lessonContainer.appendChild(cardDiv);
}

function checkAnswer(selected, correct, cardDiv) {
    const buttons = cardDiv.querySelectorAll('.choices button');
    buttons.forEach(button => {
        button.disabled = true; // Disable all buttons after an answer is chosen
        if (button.textContent === correct) {
            button.classList.add('correct');
        } else if (button.textContent === selected) {
            button.classList.add('incorrect');
        }
    });

    if (selected === correct) {
        score++;
    }
    
    const feedback = document.createElement('p');
    feedback.textContent = selected === correct ? "Correct!" : `Sorry, the correct answer is ${correct}.`;
    lessonContainer.appendChild(feedback);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => showNextCard();
    lessonContainer.appendChild(nextButton);
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => {
        this.style.display = 'none';
    }, 0);
}

function handleDragEnd() {
    setTimeout(() => {
        if (draggedItem) {
            draggedItem.style.display = 'block';
            draggedItem = null;
        }
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        let allItems = Array.from(document.querySelectorAll('.scrambled-item'));
        let draggedIndex = allItems.indexOf(draggedItem);
        let dropIndex = allItems.indexOf(this);
        
        const parent = document.getElementById('scrambled-sentences');
        if(draggedIndex < dropIndex) {
            parent.insertBefore(draggedItem, this.nextSibling);
        } else {
            parent.insertBefore(draggedItem, this);
        }
    }
}


function checkScrambledAnswer(correctOrder) {
    const container = document.getElementById('scrambled-sentences');
    const userOrder = Array.from(container.children).map(child => child.textContent);
    
    let isCorrect = true;
    for(let i=0; i<correctOrder.length; i++) {
        if(userOrder[i] !== correctOrder[i]) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        score++;
    }
    
    const feedback = document.createElement('p');
    feedback.textContent = isCorrect ? "Correct! That's the right order." : "Not quite right. Try again or check the answer.";
    if(!isCorrect) {
        const showAnswerButton = document.createElement('button');
        showAnswerButton.textContent = 'Show Answer';
        showAnswerButton.onclick = () => {
            const answerDisplay = document.createElement('div');
            answerDisplay.innerHTML = '<h4>Correct Order:</h4><ol>' + correctOrder.map(s => `<li>${s}</li>`).join('') + '</ol>';
            lessonContainer.appendChild(answerDisplay);
            showAnswerButton.style.display = 'none';
        }
        lessonContainer.appendChild(showAnswerButton);
    }
    lessonContainer.appendChild(feedback);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => showNextCard();
    lessonContainer.appendChild(nextButton);

    // Disable dragging and the check button
    const items = document.querySelectorAll('.scrambled-item');
    items.forEach(item => item.draggable = false);
    const checkButton = lessonContainer.querySelector('button');
    if(checkButton && checkButton.textContent === 'Check Order') {
       checkButton.disabled = true;
    }
}


function showNextCard() {
    currentCard++;
    if (currentCard < lesson.length) {
        buildCard(lesson[currentCard]);
    } else {
        showFinalScore();
    }
}

function showFinalScore() {
    lessonContainer.innerHTML = '';
    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('card-content');
    const totalQuestions = lesson.filter(card => card.type !== 'briefing').length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    const scoreText = document.createElement('h2');
    scoreText.textContent = `Lesson Complete!`;
    const scoreDetails = document.createElement('p');
    scoreDetails.textContent = `You scored ${score} out of ${totalQuestions} (${percentage.toFixed(2)}%).`;
    scoreDiv.appendChild(scoreText);
    scoreDiv.appendChild(scoreDetails);

    const lessonId = window.location.pathname.split('/').pop().replace('.html', '');
    localStorage.setItem(lessonId, 'completed');

    lessonContainer.appendChild(scoreDiv);
}

// Start the lesson
buildCard(lesson[currentCard]); 