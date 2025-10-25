// Utility Functions
console.log('Loading utility functions...');

function checkAction() {
    console.log('Check button clicked!');
    
}

function testCard() {
    if (yugiohGame && yugiohGame.hand[0].length > 0) {
        const randomCard = yugiohGame.hand[0][Math.floor(Math.random() * yugiohGame.hand[0].length)];
        yugiohGame.displayCardInViewer(randomCard);
    } else if (yugiohGame && yugiohGame.hand[2].length > 0) {
        const randomCard = yugiohGame.hand[2][Math.floor(Math.random() * yugiohGame.hand[2].length)];
        yugiohGame.displayCardInViewer(randomCard);
    } else {
        alert('No cards in any hand to display!');
    }
}

// Initialize game when DOM loads
let yugiohGame;
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    try {
        yugiohGame = new YuGiOhGame();
        console.log('✓ Yu-Gi-Oh Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});

console.log('Utility functions loaded successfully');
