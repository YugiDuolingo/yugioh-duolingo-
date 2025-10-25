// Yu-Gi-Oh Game Main Class - Fixed Double-Click and Face-Down Logic
console.log('Loading Yu-Gi-Oh Game Engine with Fixed Events...');

class YuGiOhGame {
    constructor() {
        console.log('Initializing Yu-Gi-Oh Game...');
        this.initializeGameState();
        this.setupEventListeners();
        const checkButton = document.querySelector('.check-section');
        if (checkButton) {
            checkButton.addEventListener('click', () => {
                checkButton.classList.toggle('active');
                console.log('Check action ');
            });
        }

        console.log('Game initialized successfully!');
        this.autoStartGame();
    }

    initializeGameState() {
        // Clean array structure - [player1, player2]
        this.deck = [[], []];
        this.hand = [[], []];
        this.monsterField = [[], []];
        this.spellTrapField = [[], []];
        this.grave = [[], []];
        this.lp = [8000, 8000];
        this.lpHistory = [[8000], [8000]]; // Track LP changes for undo
        this.turn = 1; // 1 for player1, -1 for player2
        this.turnCounter = 1;
        this.blockAttack = false;
        this.mp = true;
        this.bp = false;
        this.ep = false;

        // Battle system variables - Multiple attacks
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.attackedThisTurn = [];
        this.battling = false;
        this.positionSwitched = [];
        this.firstTurn = true;
        this.activeTransferPlayer = null; // Tracks active transfer target (1 for P1, 2 for P2, or null)
// Stat Modifiers
this.atkModValue = 100;
this.atkModDir = 1; // 1 for +, -1 for -
this.defModValue = 100;
this.defModDir = 1;
this.activeAtkMod = false;
this.activeDefMod = false;



        console.log('Game state initialized');
    }

    autoStartGame() {
        console.log('Auto-starting game...');

        if (typeof player1Deck !== 'undefined' && Array.isArray(player1Deck)) {
            this.deck[0] = [...player1Deck];
            console.log('Player 1 deck loaded:', this.deck[0].length, 'cards');
        } else {
            console.error('Player 1 deck not found!');
        }

        if (typeof player2Deck !== 'undefined' && Array.isArray(player2Deck)) {
            this.deck[1] = [...player2Deck];
            console.log('Player 2 deck loaded:', this.deck[1].length, 'cards');
        } else {
            console.error('Player 2 deck not found!');
        }

        this.hand[0] = [];
        this.hand[1] = [];
        this.monsterField[0] = [];
        this.monsterField[1] = [];
        this.spellTrapField[0] = [];
        this.spellTrapField[1] = [];
        this.grave[0] = [];
        this.grave[1] = [];

        this.shuffleDeck(0);
        this.shuffleDeck(1);

        // Give both players starting hands (6 cards for P1, 5 for P2)
        for (let i = 0; i < 6; i++) {
            if (this.deck[0].length > 0) {
                const card = this.deck[0].pop();
                this.hand[0].push(card);
            }
        }
        for (let i = 0; i < 5; i++) {
            if (this.deck[1].length > 0) {
                const card = this.deck[1].pop();
                this.hand[1].push(card);
            }
        }

        console.log('Final hand sizes - P1:', this.hand[0].length, 'P2:', this.hand[1].length);

        this.updateDisplay();
        this.displayAllCards();
        this.setMainPhase();

        console.log('Game auto-started with card images!');
    }

    shuffleDeck(deckIndex) {
        const deck = this.deck[deckIndex];
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    getCardType(card) {
        if (card.atr === 'spell') return 'spell';
        if (card.atr === 'trap') return 'trap';
        return 'monster';
    }

    // Play audio function
    playCardAudio(card) {
        try {
            const audio = new Audio(`cards audio/${card.cn}.mp3`);
            audio.volume = 0.5;
            audio.play().catch(e => {
                console.log(`Could not play audio for ${card.cn}:`, e.message);
            });
        } catch (error) {
            console.log(`Audio file not found for ${card.cn}`);
        }
    }

    // Position toggle function - works anytime, no restrictions
    // UPDATED: Position toggle function with audio
    toggleMonsterPosition(card, playerIndex) {
        // Remove turn restriction so player can toggle any time
        const newPosition = card.position === 'attack' ? 'defense' : 'attack';
        card.position = newPosition;
        card.faceUp = true;
        console.log(`${card.cn} switched to ${newPosition} position`);
        this.playCardAudio(card);
        this.displayAllCards();
        return true;
    }


    // Play monster with proper face-down support
    playMonster(card, playerIndex, position = 'attack', faceUp = true) {


        const cardIndex = this.hand[playerIndex].findIndex(c => c.cn === card.cn);

        if (cardIndex !== -1) {
            const playedCard = this.hand[playerIndex].splice(cardIndex, 1)[0];
            playedCard.position = position;
            playedCard.faceUp = faceUp;
            playedCard.justSummoned = true;
            playedCard.summonTurn = this.turnCounter;

            // Store original values for restoration
            if (!playedCard.originalAk) playedCard.originalAk = playedCard.ak;
            if (!playedCard.originalDf) playedCard.originalDf = playedCard.df;

            this.monsterField[playerIndex].push(playedCard);

            const positionText = position === 'attack' ? 'Attack Position' : 'Defense Position';
            const faceText = faceUp ? 'face-up' : 'face-down';
            console.log(`Player ${playerIndex + 1} played ${playedCard.cn} in ${positionText} ${faceText}`);

            // Play audio when played face-up
            if (faceUp) {
                this.playCardAudio(playedCard);
            }

            this.updateDisplay();
            this.displayAllCards();
            return true;
        }
        return false;
    }

    playSpellTrapFaceUp(card, playerIndex) {
        const cardIndex = this.hand[playerIndex].findIndex(c => c.cn === card.cn);

        if (cardIndex !== -1) {
            const playedCard = this.hand[playerIndex].splice(cardIndex, 1)[0];
            playedCard.faceUp = true;
            this.spellTrapField[playerIndex].push(playedCard);

            console.log(`Player ${playerIndex + 1} activated ${playedCard.cn} face-up`);
            this.playCardAudio(playedCard);

            this.updateDisplay();
            this.displayAllCards();
            return true;
        }
        return false;
    }

    playSpellTrapFaceDown(card, playerIndex) {
        const cardIndex = this.hand[playerIndex].findIndex(c => c.cn === card.cn);

        if (cardIndex !== -1) {
            const playedCard = this.hand[playerIndex].splice(cardIndex, 1)[0];
            playedCard.faceUp = false;
            this.spellTrapField[playerIndex].push(playedCard);

            console.log(`Player ${playerIndex + 1} set ${playedCard.cn} face-down`);
            this.updateDisplay();
            this.displayAllCards();
            return true;
        }
        return false;
    }

    // UPDATED: Send spell/trap to graveyard with audio
    sendSpellTrapToGraveyard(card, playerIndex) {
        const cardIndex = this.spellTrapField[playerIndex].findIndex(c => c.cn === card.cn);

        if (cardIndex !== -1) {
            const removedCard = this.spellTrapField[playerIndex].splice(cardIndex, 1)[0];
            this.grave[playerIndex].push(removedCard);

            console.log(`Player ${playerIndex + 1} sent ${removedCard.cn} to graveyard`);

            // NEW: Play audio when spell/trap sent to graveyard
            this.playCardAudio(removedCard);

            this.updateDisplay();
            this.displayAllCards();
            return true;
        }
        return false;
    }


    // Send monster to graveyard with stat restoration
    sendMonsterToGraveyard(card, playerIndex) {
        const cardIndex = this.monsterField[playerIndex].findIndex(c => c.cn === card.cn);

        if (cardIndex !== -1) {
            const removedCard = this.monsterField[playerIndex].splice(cardIndex, 1)[0];

            // Restore original stats when leaving field
            if (removedCard.originalAk !== undefined) {
                removedCard.ak = removedCard.originalAk;
            }
            if (removedCard.originalDf !== undefined) {
                removedCard.df = removedCard.originalDf;
            }

            this.grave[playerIndex].push(removedCard);

            console.log(`${removedCard.cn} sent to graveyard (stats restored)`);
            this.playCardAudio(removedCard);

            this.updateDisplay();
            this.displayAllCards();
            return true;
        }
        return false;
    }

    // FIXED: Flip face-down card face-up (monsters go to ATTACK position)
    flipCardFaceUp(card, playerIndex) {
        if (card.faceUp) {
            console.log(`${card.cn} is already face-up`);
            this.playCardAudio(card);
            return false;

        }

        card.faceUp = true;

        // FIXED: Monsters ALWAYS go to attack position when manually flipped by player
        if (this.getCardType(card) === 'monster') {
            card.position = 'attack';
            console.log(`${card.cn} flipped face-up in Attack Position!`);
        } else {
            console.log(`${card.cn} flipped face-up!`);
        }

        this.playCardAudio(card);
        this.displayAllCards();
        return true;
    }

    // Battle System with audio
    selectAttacker(card, playerIndex) {
        if (!this.bp) return;
        if (this.turn !== (playerIndex === 0 ? 1 : -1)) return;
        if (card.position !== 'attack') return;

        if (this.firstTurn && this.turnCounter === 1) {
            this.updateBattleStatus("Cannot attack on the first turn!");
            return;
        }

        // Check if this is confirming an attack
        if (this.selectedAttacker && this.selectedTarget &&
            this.selectedAttacker.card.cn === card.cn &&
            this.selectedAttacker.playerIndex === playerIndex) {

            this.confirmAttack();
            return;
        }

        // Clear previous selections
        this.selectedAttacker = {
            card: card,
            playerIndex: playerIndex,
            cardId: card.cn + playerIndex
        };
        this.selectedTarget = null;

        console.log('Selected attacker:', card.cn);
        this.updateBattleStatus(`${card.cn} selected! Choose target or click opponent LP for direct attack.`);
        this.playCardAudio(card);
        this.displayAllCards();
    }

    // UPDATED: Select target - no longer flips face-down monsters immediately
    selectTarget(targetCard, targetPlayerIndex) {
        if (!this.selectedAttacker || !this.bp) return;

        // REMOVED: Face-down monster flipping - will happen after attack confirmation
        this.selectedTarget = {
            card: targetCard,
            playerIndex: targetPlayerIndex
        };

        console.log('Selected target:', targetCard.cn);
        this.updateBattleStatus(`Target: ${targetCard.cn}. Click ${this.selectedAttacker.card.cn} again to confirm attack!`);

        // Play audio when selected as target
        if (targetCard.faceUp) {
            this.playCardAudio(targetCard);
        }


        this.displayAllCards();
    }

    // UPDATED: Confirm attack - now flips face-down monsters AFTER confirmation
    confirmAttack() {
        if (!this.selectedAttacker || !this.selectedTarget) return;
        this.battling = true;

        // Flip facedown target monster face-up before damage calculation
        if (!this.selectedTarget.card.faceUp) {
            this.selectedTarget.card.faceUp = true;
            this.selectedTarget.card.position = 'defense'; // Flip to defense position if facedown
            console.log(`${this.selectedTarget.card.cn} flipped face-up in Defense Position after attack confirmation!`);
            this.playCardAudio(this.selectedTarget.card);
            this.displayAllCards();
        }

        const attacker = this.selectedAttacker.card;
        const target = this.selectedTarget.card;

        console.log(`${attacker.cn} attacks ${target.cn}!`);
        this.updateBattleStatus(`${attacker.cn} attacks ${target.cn}!`);

        setTimeout(() => {
            this.calculateBattleDamage(attacker, this.selectedAttacker.playerIndex, target, this.selectedTarget.playerIndex);
        }, 1000);
    }






    // UPDATED: Calculate battle damage with proper defense position rules
    calculateBattleDamage(attacker, attackerPlayer, defender, defenderPlayer) {
        const attackerATK = attacker.ak || 0;
        let battleResult;
        let damage = 0;

        if (defender.position === 'attack') {
            const defenderATK = defender.ak || 0;
            console.log(`Battle: ${attacker.cn} (${attackerATK}) vs ${defender.cn} (${defenderATK}) in Attack Position`);

            if (attackerATK > defenderATK) {
                damage = attackerATK - defenderATK;
                this.modifyLP(defenderPlayer, -damage);
                battleResult = `${attacker.cn} wins! ${damage} damage dealt. ${defender.cn} can be sent to graveyard manually.`;
                this.addDestroyedIndicatorByCard(defender, defenderPlayer);


                /////// // this.displayAllCards();
            } else if (attackerATK < defenderATK) {
                damage = defenderATK - attackerATK;
                this.modifyLP(attackerPlayer, -damage);
                battleResult = `${defender.cn} wins! ${damage} damage dealt. ${attacker.cn} can be sent to graveyard manually.`;
                //this.sendMonsterToGraveyard(attacker, attackerPlayer);
                this.addDestroyedIndicatorByCard(attacker, attackerPlayer);
            } else {
                battleResult = "Equal ATK! Both monsters can be sent to graveyard manually.";
                //this.sendMonsterToGraveyard(defender, defenderPlayer);
                this.addDestroyedIndicatorByCard(defender, defenderPlayer);
                // this.sendMonsterToGraveyard(attacker, attackerPlayer); 
                this.addDestroyedIndicatorByCard(attacker, attackerPlayer);
            }
        } else {
            // FIXED: Defense position battle - attacker takes damage when ATK < DEF
            const defenderDEF = defender.df || 0;
            console.log(`Battle: ${attacker.cn} (${attackerATK}) vs ${defender.cn} (${defenderDEF}) in Defense Position`);

            if (attackerATK > defenderDEF) {
                battleResult = `${attacker.cn} wins! ${defender.cn} can be sent to graveyard manually. No damage to players.`;
                //this.sendMonsterToGraveyard(defender, defenderPlayer);
                this.addDestroyedIndicatorByCard(defender, defenderPlayer);
            } else if (attackerATK < defenderDEF) {
                // FIXED: Attacker owner takes damage equal to the difference
                damage = defenderDEF - attackerATK;
                this.modifyLP(attackerPlayer, -damage);
                battleResult = `${defender.cn} defends! ${damage} damage to ${attacker.cn}'s owner. ${defender.cn} stays on field.`;
            } else {
                battleResult = "Equal values! No destruction, no damage to either player.";
            }
        }

        console.log(battleResult);
        this.updateBattleStatus(battleResult);

        // Show damage popup if damage was dealt
        if (damage > 0) {
            this.showDamagePopup(damage);
        }

        setTimeout(() => {
            this.endBattle();
            this.checkGameOver();
        }, 2000);
    }

    // Add this helper function
    addDestroyedIndicatorByCard(card, player) {
        console.log('Adding indicator for:', card.cn, 'player:', player);

        // Check BOTH fields
        const fieldIds = ['player1MonsterField', 'player2MonsterField'];

        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            // Look for cards directly (no wrapper anymore)
            const cardElements = field.querySelectorAll('.yugioh-card');

            cardElements.forEach(cardElement => {
                const cardNameElement = cardElement?.querySelector('.cn-class');
                const cardName = cardNameElement?.textContent;

                if (cardName === card.cn) {
                    console.log('FOUND in', fieldId, '- Adding indicator');

                    // Check if indicator already exists
                    if (cardElement.querySelector('.destroyed-indicator')) {
                        return; // Already has indicator
                    }

                    const indicator = document.createElement('div');
                    indicator.className = 'destroyed-indicator';
                    indicator.textContent = '💀';
                    indicator.style.position = 'absolute';
                    indicator.style.top = '50%';
                    indicator.style.left = '50%';
                    indicator.style.transform = 'translate(-50%, -50%)';
                    indicator.style.background = 'rgba(255, 0, 0, 0.95)';
                    indicator.style.color = 'white';
                    indicator.style.fontWeight = 'bold';
                    indicator.style.fontSize = '48px';
                    indicator.style.padding = '10px 20px';
                    indicator.style.borderRadius = '10px';
                    indicator.style.border = '3px solid #ff0000';
                    indicator.style.zIndex = '20';
                    indicator.style.pointerEvents = 'none';

                    cardElement.appendChild(indicator);
                    cardElement.style.opacity = '0.6';
                    cardElement.style.filter = 'grayscale(50%)';
                }
            });
        });
    }





    directAttack() {
        if (!this.selectedAttacker) return;

        const targetPlayerIndex = this.selectedAttacker.playerIndex === 0 ? 1 : 0;

        if (this.monsterField[targetPlayerIndex].length > 0) {
            this.updateBattleStatus("Cannot attack directly while opponent has monsters!");
            return;
        }

        this.battling = true;
        const attacker = this.selectedAttacker.card;
        const damage = attacker.ak || 0;

        console.log(`${attacker.cn} attacks directly for ${damage} damage!`);
        this.updateBattleStatus(`${attacker.cn} attacks directly for ${damage} damage!`);

        this.modifyLP(targetPlayerIndex, -damage);
        this.showDamagePopup(damage);

        setTimeout(() => {
            this.endBattle();
            this.checkGameOver();
        }, 2000);
    }

    // LP modification with history tracking
    modifyLP(playerIndex, amount) {
        const oldLP = this.lp[playerIndex];
        this.lp[playerIndex] += amount;

        this.lpHistory[playerIndex].push(this.lp[playerIndex]);
        if (this.lpHistory[playerIndex].length > 10) {
            this.lpHistory[playerIndex].shift();
        }

        console.log(`Player ${playerIndex + 1} LP: ${oldLP} → ${this.lp[playerIndex]}`);
        this.updateDisplay();
    }

    undoLastLPChange(playerIndex) {
        if (this.lpHistory[playerIndex].length > 1) {
            this.lpHistory[playerIndex].pop();
            const previousLP = this.lpHistory[playerIndex][this.lpHistory[playerIndex].length - 1];
            this.lp[playerIndex] = previousLP;
            this.updateDisplay();
            console.log(`Player ${playerIndex + 1} LP restored to: ${previousLP}`);
        }
    }

    showDamagePopup(damage) {
        const popup = document.createElement('div');
        popup.className = 'damage-popup';
        popup.textContent = `-${damage}`;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            font-size: 48px;
            font-weight: bold;
            padding: 20px;
            border-radius: 10px;
            z-index: 3000;
            animation: damageAnimation 1s ease-out forwards;
        `;

        if (!document.getElementById('damage-animation-style')) {
            const style = document.createElement('style');
            style.id = 'damage-animation-style';
            style.textContent = `
                @keyframes damageAnimation {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(popup);

        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1000);
    }

    endBattle() {
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.battling = false;
        this.hideBattleStatus();
        this.updateDisplay();
        this.displayAllCards();
        console.log("Battle ended");
    }

    checkGameOver() {
        if (this.lp[0] <= 0) {
            alert("Player 2 wins! Player 1 LP reached 0!");
        } else if (this.lp[1] <= 0) {
            alert("Player 1 wins! Player 2 LP reached 0!");
        }
    }

    updateBattleStatus(message) {
        const statusPanel = document.getElementById('battleStatus');
        const messageDiv = document.getElementById('battleMessage');

        if (statusPanel && messageDiv) {
            messageDiv.textContent = message;
            statusPanel.style.display = 'block';

            setTimeout(() => {
                if (statusPanel.style.display === 'block') {
                    statusPanel.style.display = 'none';
                }
            }, 3000);
        }
    }

    hideBattleStatus() {
        const statusPanel = document.getElementById('battleStatus');
        if (statusPanel) {
            statusPanel.style.display = 'none';
        }
    }

    displayAllCards() {
        console.log('Displaying all cards...');
        this.displayPlayer1Hand();
        this.displayPlayer2Hand();
        this.displayPlayer1MonsterField();
        this.displayPlayer2MonsterField();
        this.displayPlayer1SpellTrapField();
        this.displayPlayer2SpellTrapField();
        console.log('All cards displayed');
    }

    displayPlayer1Hand() {
        const container = document.getElementById('player1HandBottom');
        if (!container) {
            console.error('Player 1 hand container not found!');
            return;
        }

        container.innerHTML = '';

        for (let i = 0; i < this.hand[0].length; i++) {
            if (this.hand[0][i]) {
                const cardElement = this.createYuGiOhCard(this.hand[0][i], i, 1, 'hand');
                container.appendChild(cardElement);
            }
        }
    }

    displayPlayer2Hand() {
        const container = document.getElementById('player2HandTop');
        if (!container) {
            console.error('Player 2 hand container not found!');
            return;
        }

        container.innerHTML = '';

        for (let i = 0; i < this.hand[1].length; i++) {
            if (this.hand[1][i]) {
                const cardElement = this.createYuGiOhCard(this.hand[1][i], i, 2, 'hand');
                container.appendChild(cardElement);
            }
        }
    }

    displayPlayer1MonsterField() {
        const container = document.getElementById('player1MonsterField');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < this.monsterField[0].length; i++) {
            if (this.monsterField[0][i]) {
                const fieldCardContainer = this.createFieldCardWithStats(this.monsterField[0][i], i, 1);
                container.appendChild(fieldCardContainer);
            }
        }
    }

    displayPlayer2MonsterField() {
        const container = document.getElementById('player2MonsterField');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < this.monsterField[1].length; i++) {
            if (this.monsterField[1][i]) {
                const fieldCardContainer = this.createFieldCardWithStats(this.monsterField[1][i], i, 2);
                container.appendChild(fieldCardContainer);

            }
        }
    }

    displayPlayer1SpellTrapField() {
        const container = document.getElementById('player1SpellTrapField');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < this.spellTrapField[0].length; i++) {
            if (this.spellTrapField[0][i]) {
                const cardElement = this.createYuGiOhCard(this.spellTrapField[0][i], i, 1, 'spelltrapfield');
                container.appendChild(cardElement);
            }
        }
    }

    displayPlayer2SpellTrapField() {
        const container = document.getElementById('player2SpellTrapField');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < this.spellTrapField[1].length; i++) {
            if (this.spellTrapField[1][i]) {
                const cardElement = this.createYuGiOhCard(this.spellTrapField[1][i], i, 2, 'spelltrapfield');
                container.appendChild(cardElement);
            }
        }
    }

    createFieldCardWithStats(card, index, player) {
        // Create the card directly (no wrapper container)
        const cardElement = this.createYuGiOhCard(card, index, player, 'field');
        cardElement.style.position = 'relative'; // Make sure positioning works

        // Add ATK/DEF stats display if it's a monster and face-up
        /* if (this.getCardType(card) === 'monster' && card.faceUp) {
             const atkDefDisplay = document.createElement('div');
             atkDefDisplay.className = `field-atk-def player${player}`;
             atkDefDisplay.textContent = `${card.ak || 0}/${card.df || 0}`;
                    cardElement.appendChild(atkDefDisplay);
         } */

        // Add defense position indicator
        if (card.position === 'defense') {
            const defenseIndicator = document.createElement('div');
            defenseIndicator.className = 'defense-indicator';
            defenseIndicator.textContent = 'D';
            defenseIndicator.style.position = 'absolute';
            defenseIndicator.style.top = '5px';
            defenseIndicator.style.right = '5px';
            defenseIndicator.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
            defenseIndicator.style.color = 'white';
            defenseIndicator.style.padding = '3px 8px';
            defenseIndicator.style.borderRadius = '50%';
            defenseIndicator.style.fontSize = '14px';
            defenseIndicator.style.fontWeight = 'bold';
            defenseIndicator.style.zIndex = '1';
            cardElement.appendChild(defenseIndicator);
        }

        // Add destroyed indicator if card is marked as destroyed
        if (card.destroyed) {
            const destroyedIndicator = document.createElement('div');
            destroyedIndicator.className = 'destroyed-indicator';
            destroyedIndicator.textContent = '💀';
            destroyedIndicator.style.position = 'absolute';
            destroyedIndicator.style.top = '50%';
            destroyedIndicator.style.left = '50%';
            destroyedIndicator.style.transform = 'translate(-50%, -50%)';
            destroyedIndicator.style.background = 'rgba(255, 0, 0, 0.95)';
            destroyedIndicator.style.color = 'white';
            destroyedIndicator.style.fontWeight = 'bold';
            destroyedIndicator.style.fontSize = '48px';
            destroyedIndicator.style.padding = '10px 20px';
            destroyedIndicator.style.borderRadius = '10px';
            destroyedIndicator.style.border = '3px solid #ff0000';
            destroyedIndicator.style.zIndex = '20';
            destroyedIndicator.style.pointerEvents = 'none';
            cardElement.appendChild(destroyedIndicator);

            // Dim the card
            cardElement.style.opacity = '0.6';
            cardElement.style.filter = 'grayscale(50%)';
        }

        return cardElement;
    }









    // Create card with real images
    createYuGiOhCard(card, index, player, location) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `yugioh-card ${this.getCardType(card)}`;



        if (player === 2) {
            cardDiv.classList.add('player2');
        }

        // Brown color for face-down cards
        if ((location === 'field' || location === 'spelltrapfield') && !card.faceUp) {
            cardDiv.classList.add('face-down');
            cardDiv.style.backgroundColor = '#8B4513';
        }

        // Add highlighting
        if (this.selectedAttacker &&
            this.selectedAttacker.card.cn === card.cn &&
            this.selectedAttacker.playerIndex === (player === 1 ? 0 : 1)) {
            cardDiv.classList.add('selected-attacker');
        }

        if (this.selectedTarget &&
            this.selectedTarget.card.cn === card.cn &&
            this.selectedTarget.playerIndex === (player === 1 ? 0 : 1)) {
            cardDiv.classList.add('selected-target');
        }

        // Card sections
        const nameSection = document.createElement('div');
        nameSection.className = 'card-name';

        const cnClass = document.createElement('span');
        cnClass.className = 'cn-class';
        cnClass.textContent = card.faceUp === false && (location === 'field' || location === 'spelltrapfield')
            ? 'FACE-DOWN' : card.cn;

        const atrClass = document.createElement('span');
        atrClass.className = 'atr-class';
        atrClass.textContent = card.faceUp === false && (location === 'field' || location === 'spelltrapfield')
            ? '' : card.atr.toUpperCase().substring(0, 4);

        nameSection.appendChild(cnClass);
        //nameSection.appendChild(atrClass);

        const trSection = document.createElement('div');
        trSection.className = 'tr-class';
        if (card.faceUp === false && (location === 'field' || location === 'spelltrapfield')) {
            trSection.textContent = '';
        } else if (this.getCardType(card) === 'monster') {
            trSection.textContent = '★'.repeat(Math.min(card.tr || 1, 6));
        } else if (this.getCardType(card) === 'spell') {
            trSection.textContent = 'SPELL';
        } else {
            trSection.textContent = 'TRAP';
        }

        // Image section with real card images
        const imageSection = document.createElement('div');
        imageSection.className = 'card-image';

        if (card.faceUp === false && (location === 'field' || location === 'spelltrapfield')) {
            imageSection.textContent = 'FACE-DOWN';
            imageSection.style.backgroundColor = '#8B4513';
        } else {
            // Load real card image
            const img = document.createElement('img');
            img.src = `images/${card.cn}.jpg`;
            img.alt = card.cn;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: fill;
                border-radius: 2px;
            `;

            img.onerror = function () {
                // Fallback to text if image not found
                imageSection.textContent = this.getCardType(card);
                imageSection.style.backgroundColor = '#4a4a4a';
            }.bind(this);

            imageSection.appendChild(img);
            imageSection.style.backgroundColor = 'transparent';
        }

        const tpSection = document.createElement('div');
        tpSection.className = 'tp-class';
        tpSection.textContent = card.faceUp === false && (location === 'field' || location === 'spelltrapfield')
            ? '' : (card.tp || 'Normal');

        const akdfSection = document.createElement('div');
        akdfSection.className = 'ak-df-class';
        if (card.faceUp === false && (location === 'field' || location === 'spelltrapfield')) {
            akdfSection.textContent = '';
        } else if (this.getCardType(card) === 'monster') {
            akdfSection.textContent = `${card.ak || 0}/${card.df || 0}`;
        } else {
            akdfSection.textContent = '';
        }

        cardDiv.appendChild(nameSection);
        cardDiv.appendChild(trSection);
        cardDiv.appendChild(imageSection);
        //cardDiv.appendChild(tpSection);
        cardDiv.appendChild(akdfSection);

        cardDiv.title = `${card.cn} - ${card.desc || 'No description'}`;

        // FIXED: Enhanced click handlers with proper double-click handling
        this.setupCardEventListeners(cardDiv, card, player, location);

        return cardDiv;
    }

    // FIXED: Event listener setup with proper double-click handling
    setupCardEventListeners(cardDiv, card, player, location) {
        const playerIndex = player === 1 ? 0 : 1;
        let clickTimeout;

        // FIXED: Single click handler with delay to allow double-clicks
        cardDiv.addEventListener('click', (e) => {
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
                return; // Double-click will handle this
            }

            clickTimeout = setTimeout(() => {
                clickTimeout = null;
                const checkButton = document.querySelector('.check-section');
                const checkActive = checkButton && checkButton.classList.contains('active');

                if (checkActive) {
                    this.showCardModificationPopup(card, playerIndex);
                } else {
                    if (location === 'hand') {
                        this.handleHandCardClick(card, playerIndex);
                    } else if (location === 'field') {
                        this.handleFieldCardClick(card, playerIndex);
                    } else if (location === 'spelltrapfield') {
                        this.handleSpellTrapFieldClick(card, playerIndex);
                    }
                }
            }, 250); // 250ms delay to detect double-clicks
        });


        // FIXED: Double click handler - now works properly
        cardDiv.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }

            console.log(`Double-click detected on ${card.cn} in ${location}`);
            const audio = new Audio('sfx/graveyard.mp3');

            if (location === 'hand') {
                this.handleHandCardDoubleClick(card, playerIndex);
            } else if (location === 'field') {
                if (this.getCardType(card) === 'monster') {
                    this.sendMonsterToGraveyard(card, playerIndex);
                    audio.play();
                }
            } else if (location === 'spelltrapfield') {
                this.sendSpellTrapToGraveyard(card, playerIndex);
                audio.play();
            }
        });

        // Hold click for card modification popup 

    }

    handleHandCardClick(card, playerIndex) {
        console.log(`Single-click on ${card.cn} in hand`);
        if (this.getCardType(card) === 'monster') {
            if (this.playMonster(card, playerIndex, 'attack', true)) {
                console.log(`${card.cn} played in Attack Position!`);
            }
        } else {
            if (this.playSpellTrapFaceUp(card, playerIndex)) {
                console.log(`${card.cn} activated face-up!`);
            }
        }
    }

    // FIXED: Double-click from hand = face-down
    handleHandCardDoubleClick(card, playerIndex) {
        console.log(`Double-click on ${card.cn} in hand`);
        if (this.getCardType(card) === 'monster') {
            // FIXED: Double-click monster = face-down defense
            if (this.playMonster(card, playerIndex, 'defense', false)) {
                console.log(`${card.cn} set face-down in Defense Position!`);
            }
        } else {
            // Double-click spell/trap = face-down
            if (this.playSpellTrapFaceDown(card, playerIndex)) {
                console.log(`${card.cn} set face-down!`);
            }
        }
    }

    handleFieldCardClick(card, playerIndex) {
        const currentPlayerIndex = this.turn === 1 ? 0 : 1;
       
        // Transfer to hand if direction button active
if (this.activeTransferPlayer !== null) {
  const targetPlayerIndex = this.activeTransferPlayer - 1; // 0 for P1, 1 for P2
  const isMonsterField = this.monsterField[0].some(c => c.cn === card.cn) || this.monsterField[1].some(c => c.cn === card.cn);
  const isSpellTrapField = this.spellTrapField[0].some(c => c.cn === card.cn) || this.spellTrapField[1].some(c => c.cn === card.cn);
  
  if (isMonsterField || isSpellTrapField) {
    let sourceField, sourcePlayerIndex;
    // Find source field and index
    for (let pIdx = 0; pIdx < 2; pIdx++) {
      const monsterIdx = this.monsterField[pIdx].findIndex(c => c.cn === card.cn);
      if (monsterIdx !== -1) {
        sourceField = this.monsterField[pIdx];
        sourcePlayerIndex = pIdx;
        break;
      }
      const stIdx = this.spellTrapField[pIdx].findIndex(c => c.cn === card.cn);
      if (stIdx !== -1) {
        sourceField = this.spellTrapField[pIdx];
        sourcePlayerIndex = pIdx;
        break;
      }
    }
    
    if (sourceField) {
      const cardIndex = sourceField.findIndex(c => c.cn === card.cn);
      const transferredCard = sourceField.splice(cardIndex, 1)[0];
      
      // Restore original stats for monsters
      if (this.getCardType(transferredCard) === 'monster') {
        if (transferredCard.originalAk !== undefined) transferredCard.ak = transferredCard.originalAk;
        if (transferredCard.originalDf !== undefined) transferredCard.df = transferredCard.originalDf;
      }
      
      // Add to target hand (preserve face-up/position)
      this.hand[targetPlayerIndex].push(transferredCard);
      
      console.log(`${card.cn} transferred from field (P${sourcePlayerIndex + 1}) to hand of P${this.activeTransferPlayer}`);
      this.playCardAudio(transferredCard); // Audio feedback
      this.activeTransferPlayer = null; // Clear after transfer
      document.querySelectorAll('.transfer-btn').forEach(btn => btn.classList.remove('active')); // Deactivate buttons
      
      this.updateDisplay();
      this.displayAllCards();
      return; // Exit early, skip other field actions
    }
  }
  return; // Not on field, ignore
}

// Stat Modifiers if active
if ((this.activeAtkMod || this.activeDefMod) && this.getCardType(card) === 'monster') {
  // Find card in either player's monster field
  let foundField = null;
  let foundPlayerIndex = null;
  let foundIndex = -1;
  
  for (let pIdx = 0; pIdx < 2; pIdx++) {
    const idx = this.monsterField[pIdx].findIndex(c => c.cn === card.cn);
    if (idx !== -1) {
      foundField = this.monsterField[pIdx];
      foundPlayerIndex = pIdx;
      foundIndex = idx;
      break;
    }
  }
  
  if (foundField && foundIndex !== -1) {
    const targetCard = foundField[foundIndex];
    
    // Store originals if first mod
    if (targetCard.originalAk === undefined) targetCard.originalAk = targetCard.ak;
    if (targetCard.originalDf === undefined) targetCard.originalDf = targetCard.df;
    
    // Apply mod
    if (this.activeAtkMod) {
      targetCard.ak = Math.max(0, targetCard.ak + (this.atkModValue * this.atkModDir));
       this.playCardAudio(targetCard);  // Add here: Audio on every ATK mod press
      console.log(`${targetCard.cn} ATK modified by ${this.atkModDir > 0 ? '+' : ''}${this.atkModValue} to ${targetCard.ak}`);
    }
    
    if (this.activeDefMod) {
      targetCard.df = Math.max(0, targetCard.df + (this.defModValue * this.defModDir));
       this.playCardAudio(targetCard);  // Add here: Audio on every ATK mod press     
      console.log(`${targetCard.cn} DEF modified by ${this.defModDir > 0 ? '+' : ''}${this.defModValue} to ${targetCard.df}`);
    }
    
    this.updateDisplay();
    this.displayAllCards(); // Refreshes stats visually
    return; // Prevent other field actions
  }
}



        if (this.bp && this.getCardType(card) === 'monster') {
            if (playerIndex === currentPlayerIndex) {
                // Your monster - select for attack
                if (card.position === 'attack') {
                    this.selectAttacker(card, playerIndex);
                }
            } else {
                // Opponent's monster - select as target
                if (this.selectedAttacker) {
                    this.selectTarget(card, playerIndex);
                }
            }
        } else if (1 === 1) {
            // Your card
            if (!card.faceUp) {
                // FIXED: Face-down card flipped face-up (monsters go to ATTACK position)
                this.flipCardFaceUp(card, playerIndex);
            } else if (this.getCardType(card) === 'monster') {
                // Position toggle works anytime
                this.toggleMonsterPosition(card, playerIndex);
            }
        } else {
            this.displayCardInViewer(card);
        }
    }

    handleSpellTrapFieldClick(card, playerIndex) {
  const currentPlayerIndex = this.turn === 1 ? 0 : 1;

  // Transfer to hand if direction button active (same as handleFieldCardClick)
  if (this.activeTransferPlayer !== null) {
    const targetPlayerIndex = this.activeTransferPlayer - 1; // 0 for P1, 1 for P2
    const isMonsterField = this.monsterField[0].some(c => c.cn === card.cn) || this.monsterField[1].some(c => c.cn === card.cn);
    const isSpellTrapField = this.spellTrapField[0].some(c => c.cn === card.cn) || this.spellTrapField[1].some(c => c.cn === card.cn);
    
    if (isMonsterField || isSpellTrapField) {
      let sourceField, sourcePlayerIndex;
      // Find source field and index
      for (let pIdx = 0; pIdx < 2; pIdx++) {
        const monsterIdx = this.monsterField[pIdx].findIndex(c => c.cn === card.cn);
        if (monsterIdx !== -1) {
          sourceField = this.monsterField[pIdx];
          sourcePlayerIndex = pIdx;
          break;
        }
        const stIdx = this.spellTrapField[pIdx].findIndex(c => c.cn === card.cn);
        if (stIdx !== -1) {
          sourceField = this.spellTrapField[pIdx];
          sourcePlayerIndex = pIdx;
          break;
        }
      }
      
      if (sourceField) {
        const cardIndex = sourceField.findIndex(c => c.cn === card.cn);
        const transferredCard = sourceField.splice(cardIndex, 1)[0];
        
        // Restore original stats for monsters (skipped for spells/traps)
        if (this.getCardType(transferredCard) === 'monster') {
          if (transferredCard.originalAk !== undefined) transferredCard.ak = transferredCard.originalAk;
          if (transferredCard.originalDf !== undefined) transferredCard.df = transferredCard.originalDf;
        }
        
        // Add to target hand (preserve face-up/position)
        this.hand[targetPlayerIndex].push(transferredCard);
        
        console.log(`${card.cn} transferred from field (P${sourcePlayerIndex + 1}) to hand of P${this.activeTransferPlayer}`);
        this.playCardAudio(transferredCard); // Audio feedback
        this.activeTransferPlayer = null; // Clear after transfer
        document.querySelectorAll('.transfer-btn').forEach(btn => btn.classList.remove('active')); // Deactivate buttons
        
        this.updateDisplay();
        this.displayAllCards();
        return; // Exit early, skip other field actions
      }
    }
    return; // Not on field, ignore
  }

  // Existing spell/trap logic (flips and viewer)
  if (1=== 1) {
    if (!card.faceUp) {
      this.flipCardFaceUp(card, playerIndex);
    } else {
        console.log(`${card.cn} is already face-up`);
           this.playCardAudio(card);
      this.displayCardInViewer(card);
    }
  }
}

 // Rest of the methods remain the same...
    drawCard(playerIndex) {
        if (this.deck[playerIndex].length > 0) {
            const drawnCard = this.deck[playerIndex].pop();
            this.hand[playerIndex].push(drawnCard);
            this.displayAllCards();
            this.updateDisplay();
            console.log(`Player ${playerIndex + 1} drew: ${drawnCard.cn}`);
            return drawnCard;
        }
        return null;
    }




    setMainPhase() {
        console.log('Main Phase activated');
        this.mp = true;
        this.bp = false;
        this.ep = false;
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.hideBattleStatus();
        this.updatePhaseDisplay('MP');
        this.updateGameInfo();
        this.displayAllCards();
    }

    setBattlePhase() {
        console.log('Battle Phase activated');
        this.mp = false;
        this.bp = true;
        this.ep = false;
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.updatePhaseDisplay('BP');
        this.updateGameInfo();

        const currentPlayerIndex = this.turn === 1 ? 0 : 1;
        const attackingMonsters = this.monsterField[currentPlayerIndex].filter(m => m.position === 'attack');

        if (this.firstTurn && this.turnCounter === 1) {
            this.updateBattleStatus("Cannot attack on the first turn!");
        } else if (attackingMonsters.length === 0) {
            this.updateBattleStatus("No monsters in Attack Position!");
        } else {
            this.updateBattleStatus("Battle Phase! Multiple attacks allowed. Select attacker, then target, then confirm.");
        }

        this.displayAllCards();
    }

    setEndPhase() {
        console.log('END PHASE ACTIVATED');
        this.mp = false;
        this.bp = false;
        this.ep = true;
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.hideBattleStatus();

        this.positionSwitched = [];

        // Reset justSummoned flag
        for (let playerField of this.monsterField) {
            if (Array.isArray(playerField)) {
                for (let monster of playerField) {
                    if (monster && monster.justSummoned !== undefined) {
                        monster.justSummoned = false;
                    }
                }
            }
        }

        this.turn = this.turn * (-1);
        this.turnCounter = this.turnCounter + 1;

        if (this.turnCounter > 1) {
            this.firstTurn = false;
        }

        // Draw card for new turn
        if (this.turn === 1) {
            this.drawCard(0);
        } else {
            this.drawCard(1);
        }

        this.updatePhaseDisplay('EP');
        setTimeout(() => {
            this.setMainPhase();
        }, 1000);

        this.updateDisplay();
        this.updateGameInfo();
        console.log('End Phase completed');
    }

    showGraveyard(playerIndex) {
        const graveyard = this.grave[playerIndex];
        const player = playerIndex === 0 ? 'Player 1' : 'Player 2';

        if (graveyard.length === 0) {
            alert(`${player} Graveyard is empty`);
            return;
        }

        const cardNames = graveyard.map(card => {
            if (this.getCardType(card) === 'monster') {
                return `${card.cn} (ATK:${card.ak}/DEF:${card.df})`;
            } else {
                return `${card.cn} (${card.atr})`;
            }
        }).join('\n');

        alert(`${player} Graveyard (${graveyard.length} cards):\n${cardNames}`);
    }

    updatePhaseDisplay(phase) {
        document.querySelectorAll('.phase-indicator').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeButton = document.getElementById(`${phase.toLowerCase()}-button`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    updateGameInfo() {
        const elements = {
            turnCounter: document.getElementById('turnCounter'),
            currentPlayer: document.getElementById('currentPlayer'),
            currentPhase: document.getElementById('currentPhase')
        };

        if (elements.turnCounter) elements.turnCounter.textContent = this.turnCounter;
        if (elements.currentPlayer) elements.currentPlayer.textContent = this.turn === 1 ? 'Player 1' : 'Player 2';
        if (elements.currentPhase) elements.currentPhase.textContent = this.mp ? 'Main' : this.bp ? 'Battle' : 'End';
    }

    updateDisplay() {
        const elements = {
            player1DeckCount: document.getElementById('player1DeckCount'),
            player2DeckCount: document.getElementById('player2DeckCount'),
            player1Graveyard: document.getElementById('player1-graveyard'),
            player2Graveyard: document.getElementById('player2-graveyard'),
            player1LP: document.getElementById('player1LP'),
            player2LP: document.getElementById('player2LP')
        };

        if (elements.player1DeckCount) elements.player1DeckCount.textContent = this.deck[0].length;
        if (elements.player2DeckCount) elements.player2DeckCount.textContent = this.deck[1].length;
        if (elements.player1Graveyard) elements.player1Graveyard.textContent = this.grave[0].length;
        if (elements.player2Graveyard) elements.player2Graveyard.textContent = this.grave[1].length;
        if (elements.player1LP) elements.player1LP.textContent = this.lp[0];
        if (elements.player2LP) elements.player2LP.textContent = this.lp[1];

        this.updateGameInfo();
    }

    displayCardInViewer(card) {
        const cardImg = document.getElementById('card-display');
        const placeholder = document.querySelector('.no-card-placeholder');
        const effectText = document.getElementById('cardEffect');

        if (card && cardImg && placeholder && effectText) {
            const imagePath = `images/${card.cn}.jpg`;
            cardImg.src = imagePath;
            cardImg.alt = card.cn;
            cardImg.classList.add('visible');
            placeholder.classList.add('hidden');

            let description = card.desc || 'No description available';
            effectText.textContent = description;

            cardImg.onerror = function () {
                cardImg.classList.remove('visible');
                placeholder.classList.remove('hidden');
                placeholder.textContent = `Image: ${card.cn}`;
            };
        }
    }

showModValuePopup(stat) {
  console.log(`Showing value popup for ${stat.toUpperCase()}`);
  
  const isAtk = stat === 'atk';
  const currentValue = isAtk ? this.atkModValue : this.defModValue;
  const currentDir = (isAtk ? this.atkModDir : this.defModDir) > 0 ? '+' : '-';
  
  const popup = document.createElement('div');
  popup.className = 'mod-value-popup';
  // Inline for overlay structure (unbreakable)
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100%';
  popup.style.height = '100%';
  popup.style.background = 'rgba(0, 0, 0, 0.8)';
  popup.style.display = 'flex';
  popup.style.justifyContent = 'center';
  popup.style.alignItems = 'center';
  popup.style.zIndex = '9999'; // Above all cards/popups
  popup.style.pointerEvents = 'auto';
  popup.style.fontFamily = 'Arial, sans-serif';
  document.body.style.overflow = 'hidden'; // No scroll
  
  let html = `
    <div class="popup-content" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; color: white; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); text-align: center; position: relative; border: 2px solid rgba(255, 255, 255, 0.2); box-sizing: border-box; margin: 20px;">
      <div class="popup-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid rgba(255, 255, 255, 0.3); padding-bottom: 15px;">
        <h3 style="margin: 0; font-size: 24px; font-weight: bold; flex: 1; text-align: center;">Set ${stat.toUpperCase()} Modifier Value</h3>
        <button class="close-popup" onclick="document.body.style.overflow = ''; this.closest('.mod-value-popup').remove();" style="background: #e74c3c; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; line-height: 1; box-sizing: border-box;">×</button>
      </div>
      <div class="direction-toggle" style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: center;">
        <button id="${stat}-minus" class="dir-btn ${currentDir === '-' ? 'active' : ''}" style="background: #34495e; color: white; border: none; padding: 15px 25px; border-radius: 10px; font-size: 24px; font-weight: bold; cursor: pointer; transition: all 0.2s; min-width: 80px; line-height: 1; box-sizing: border-box; appearance: none; -webkit-appearance: none;">−</button>
        <button id="${stat}-plus" class="dir-btn ${currentDir === '+' ? 'active' : ''}" style="background: #34495e; color: white; border: none; padding: 15px 25px; border-radius: 10px; font-size: 24px; font-weight: bold; cursor: pointer; transition: all 0.2s; min-width: 80px; line-height: 1; box-sizing: border-box; appearance: none; -webkit-appearance: none;">+</button>
      </div>
      <div class="preset-radios" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        <label style="display: flex; align-items: center; gap: 10px; font-size: 16px; cursor: pointer; background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px; transition: background 0.2s; border: 1px solid rgba(255, 255, 255, 0.2); box-sizing: border-box; color: white;"><input type="radio" name="preset" value="100" ${currentValue === 100 ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #27ae60; flex-shrink: 0; cursor: pointer; appearance: radio; -webkit-appearance: radio; border: none; background: none;"> 100</label>
        <label style="display: flex; align-items: center; gap: 10px; font-size: 16px; cursor: pointer; background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px; transition: background 0.2s; border: 1px solid rgba(255, 255, 255, 0.2); box-sizing: border-box; color: white;"><input type="radio" name="preset" value="500" ${currentValue === 500 ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #27ae60; flex-shrink: 0; cursor: pointer; appearance: radio; -webkit-appearance: radio; border: none; background: none;"> 500</label>
        <label style="display: flex; align-items: center; gap: 10px; font-size: 16px; cursor: pointer; background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px; transition: background 0.2s; border: 1px solid rgba(255, 255, 255, 0.2); box-sizing: border-box; color: white;"><input type="radio" name="preset" value="1000" ${currentValue === 1000 ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #27ae60; flex-shrink: 0; cursor: pointer; appearance: radio; -webkit-appearance: radio; border: none; background: none;"> 1000</label>
      </div>
      <div class="popup-buttons" style="display: flex; gap: 10px; justify-content: center;">
        <button class="cancel-btn" onclick="document.body.style.overflow = ''; this.closest('.mod-value-popup').remove();" style="padding: 15px 25px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s; flex: 1; max-width: 120px; box-sizing: border-box; appearance: none; -webkit-appearance: none; background: #95a5a6; color: white;">Cancel</button>
        <button class="ok-btn" onclick="yugiohGame.confirmModValue('${stat}'); document.body.style.overflow = '';" style="padding: 15px 25px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s; flex: 1; max-width: 120px; box-sizing: border-box; appearance: none; -webkit-appearance: none; background: #27ae60; color: white;">OK</button>
      </div>
    </div>
  `;
  
  popup.innerHTML = html;
  document.body.appendChild(popup);
  
  // Inline hover/active for direction buttons
  const minusBtn = popup.querySelector(`#${stat}-minus`);
  const plusBtn = popup.querySelector(`#${stat}-plus`);
  
  const toggleActive = (activeBtn, inactiveBtn, isActive) => {
    if (isActive) {
      activeBtn.style.background = '#e74c3c';
      activeBtn.style.boxShadow = '0 0 15px rgba(231, 76, 60, 0.5)';
      activeBtn.classList.add('active');
      inactiveBtn.style.background = '#34495e';
      inactiveBtn.style.boxShadow = 'none';
      inactiveBtn.classList.remove('active');
    }
  };
  
  minusBtn.addEventListener('click', () => toggleActive(minusBtn, plusBtn, true));
  plusBtn.addEventListener('click', () => toggleActive(plusBtn, minusBtn, true));
  
  [minusBtn, plusBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = '#2c3e50';
        btn.style.transform = 'scale(1.05)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = '#34495e';
        btn.style.transform = 'none';
      }
    });
  });
  
  // Inline hover for labels
  popup.querySelectorAll('.preset-radios label').forEach(label => {
    label.addEventListener('mouseenter', () => label.style.background = 'rgba(255, 255, 255, 0.2)');
    label.addEventListener('mouseleave', () => label.style.background = 'rgba(255, 255, 255, 0.1)');
  });
  
  // Inline hover for OK/Cancel
  const okBtn = popup.querySelector('.ok-btn');
  okBtn.addEventListener('mouseenter', () => {
    okBtn.style.background = '#219a52';
    okBtn.style.transform = 'translateY(-2px)';
    okBtn.style.boxShadow = '0 5px 15px rgba(39, 174, 96, 0.3)';
  });
  okBtn.addEventListener('mouseleave', () => {
    okBtn.style.background = '#27ae60';
    okBtn.style.transform = 'none';
    okBtn.style.boxShadow = 'none';
  });
  
  const cancelBtn = popup.querySelector('.cancel-btn');
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#7f8c8d';
    cancelBtn.style.transform = 'translateY(-2px)';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = '#95a5a6';
    cancelBtn.style.transform = 'none';
  });
  
  // Inline hover for close X
  const closeBtn = popup.querySelector('.close-popup');
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#c0392b';
    closeBtn.style.transform = 'scale(1.1)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#e74c3c';
    closeBtn.style.transform = 'none';
  });
  
  // Outside click close
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      document.body.style.overflow = '';
      popup.remove();
    }
  });
  
  // Mobile responsive inline adjustments
  if (window.innerWidth <= 768) {
    popup.querySelector('.popup-content').style.padding = '20px';
    popup.querySelector('.popup-content').style.width = '95%';
    popup.querySelector('.popup-content').style.margin = '10px';
    popup.querySelector('.direction-toggle button').style.padding = '12px 20px';
    popup.querySelector('.direction-toggle button').style.fontSize = '20px';
    popup.querySelector('.direction-toggle button').style.minWidth = '70px';
    popup.querySelectorAll('.preset-radios label').forEach(l => l.style.fontSize = '14px');
    popup.querySelector('h3').style.fontSize = '20px';
    popup.querySelectorAll('.popup-buttons button').forEach(b => {
      b.style.padding = '12px 20px';
      b.style.fontSize = '14px';
      b.style.maxWidth = 'none';
    });
    popup.querySelectorAll('input[type="radio"]').forEach(r => {
      r.style.width = '18px';
      r.style.height = '18px';
    });
  }
  
  console.log(`${stat.toUpperCase()} value popup shown with inline styles`);
}



confirmModValue(stat) {
  const popup = document.querySelector('.mod-value-popup');
  if (!popup) return;
  
  const selectedPreset = popup.querySelector('input[name="preset"]:checked')?.value || '100';
  const isPlus = popup.querySelector(`#${stat}-plus`).classList.contains('active');
  
  const value = parseInt(selectedPreset);
  const dir = isPlus ? 1 : -1;
  
  if (stat === 'atk') {
    this.atkModValue = value;
    this.atkModDir = dir;
    const btn = document.getElementById('atk-mod-btn');
    if (btn) btn.textContent = `${dir > 0 ? '+' : ''}${value} ATK`;
  } else {
    this.defModValue = value;
    this.defModDir = dir;
    const btn = document.getElementById('def-mod-btn');
    if (btn) btn.textContent = `${dir > 0 ? '+' : ''}${value} DEF`;
  }
  
  popup.remove();
  document.body.classList.remove('popup-open'); // CSS handles overflow reset
  console.log(`${stat.toUpperCase()} mod updated to ${dir > 0 ? '+' : ''}${value}`);
}




    // LP Modification Popup
    showLPModificationPopup(playerIndex) {
        if (!this.mp) {
            console.log("Can only modify LP in Main Phase");
            return;
        }

        const popup = document.createElement('div');
        popup.className = 'lp-modification-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>Modify Player ${playerIndex + 1} LP</h3>
                    <button class="close-popup" onclick="this.closest('.lp-modification-popup').remove()">×</button>
                </div>
                <div class="lp-controls">
                    <div class="plus-minus-buttons">
                        <button id="lp-minus" class="active">−</button>
                        <button id="lp-plus">+</button>
                    </div>
                    <div class="lp-buttons">
                        <button onclick="yugiohGame.modifyLPFromPopup(${playerIndex}, 1000)">1000</button>
                        <button onclick="yugiohGame.modifyLPFromPopup(${playerIndex}, 500)">500</button>
                        <button onclick="yugiohGame.modifyLPFromPopup(${playerIndex}, 100)">100</button>
                        <button onclick="yugiohGame.modifyLPFromPopup(${playerIndex}, 50)">50</button>
                        <button onclick="yugiohGame.modifyLPFromPopup(${playerIndex}, 1)">1</button>
                    </div>
                    <div class="lp-display">Current LP: <span id="current-lp-display">${this.lp[playerIndex]}</span></div>
                    <button onclick="yugiohGame.undoLastLPChange(${playerIndex}); this.closest('.lp-modification-popup').remove();">Undo Recent LP Damage</button>
                </div>
            </div> 
        `;

        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        document.body.appendChild(popup);

        const minusBtn = popup.querySelector('#lp-minus');
        const plusBtn = popup.querySelector('#lp-plus');

        minusBtn.addEventListener('click', () => {
            minusBtn.classList.add('active');
            plusBtn.classList.remove('active');
        });

        plusBtn.addEventListener('click', () => {
            plusBtn.classList.add('active');
            minusBtn.classList.remove('active');
        });
    }

    modifyLPFromPopup(playerIndex, amount) {
        const popup = document.querySelector('.lp-modification-popup');
        const isPlus = popup.querySelector('#lp-plus').classList.contains('active');
        const finalAmount = isPlus ? amount : -amount;

        this.modifyLP(playerIndex, finalAmount);

        const display = popup.querySelector('#current-lp-display');
        display.textContent = this.lp[playerIndex];
    }

    // Enhanced Bring Cards with face-up/face-down choice
    showBringCardsPopup() {
        const popup = document.createElement('div');
        popup.className = 'bring-cards-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>Bring Cards</h3>
                    <button class="close-popup" onclick="this.closest('.bring-cards-popup').remove()">×</button>
                </div>
                <div class="bring-controls">
                    <div class="location-selectors">
                        <div>
                            <label>From:</label>
                            <select id="source-location">
                                <option value="hand1">Hand 1</option>
                                <option value="hand2">Hand 2</option>
                                <option value="graveyard1">Graveyard 1</option>
                                <option value="graveyard2">Graveyard 2</option>
                                <option value="monsterfield1">Monster Field 1</option>
                                <option value="monsterfield2">Monster Field 2</option>
                                <option value="spelltrapfield1">Spell/Trap Field 1</option>
                                <option value="spelltrapfield2">Spell/Trap Field 2</option>
                                <option value="deck1">Deck 1</option>
                                <option value="deck2">Deck 2</option>
                            </select>
                        </div>
                        <div>
                            <label>To:</label>
                            <select id="destination-location">
                                <option value="hand1">Hand 1</option>
                                <option value="hand2">Hand 2</option>
                                <option value="graveyard1">Graveyard 1</option>
                                <option value="graveyard2">Graveyard 2</option>
                                <option value="monsterfield1">Monster Field 1</option>
                                <option value="monsterfield2">Monster Field 2</option>
                                <option value="spelltrapfield1">Spell/Trap Field 1</option>
                                <option value="spelltrapfield2">Spell/Trap Field 2</option>
                                <option value="deck1">Deck 1</option>
                                <option value="deck2">Deck 2</option>
                            </select>
                        </div>
                    </div>
                    <button onclick="yugiohGame.showCardSelectionPopup()">Select Cards</button>
                </div>
            </div>
        `;

        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        document.body.appendChild(popup);
    }

    showCardSelectionPopup() {
    console.log('showCardSelectionPopup called');
    const bringPopup = document.querySelector('.bring-cards-popup');
    if (!bringPopup) {
        console.error('Bring cards popup not found');
        return;
    }
    const sourceLocation = bringPopup.querySelector('#source-location').value;
    const destinationLocation = bringPopup.querySelector('#destination-location').value;
    const sourceCards = this.getCardsFromLocation(sourceLocation);
    if (sourceCards.length === 0) {
        alert('No cards in selected source location!');
        return;
    }

    const popup = document.createElement('div');
    popup.className = 'card-selection-popup';
    let html = `
        <div class="popup-content">
            <div class="popup-header">
                <h3>Select Cards to Move</h3>
                <button class="close-popup" onclick="this.closest('.card-selection-popup').remove()">×</button>
            </div>
            <div class="filter-buttons">
                <button class="filter-btn active" data-type="all">All</button>
                <button class="filter-btn" data-type="monster">Monster</button>
                <button class="filter-btn" data-type="spell">Spell</button>
                <button class="filter-btn" data-type="trap">Trap</button>
                <button id="sort-az-btn" class="filter-btn" type="button">Sort A–Z</button>
            </div>
            <div class="card-selection">`;
    
    sourceCards
    
  .forEach((card, index) => {
    const type = this.getCardType ? this.getCardType(card) : 'unknown'; // Fallback if method missing
    console.log(`Card ${card.cn} type ${type}`);
    
    let labelContent = card.cn;
    if (type === 'monster') {
      labelContent += `<br><small>ATK ${card.ak || 0} / DEF ${card.df || 0}</small>`;
    } else {
      labelContent += `<br><small>${card.atr ? card.atr.toUpperCase() : 'Unknown'}</small>`;
    }
    
    const imageUrl = `images/${card.cn}.jpg`;
    html += `
      <div class="selectable-card" data-type="${type}" data-index="${index}">
        <input type="checkbox" id="card-${index}" 
               style="
                 appearance: none;
                 width: 60px;
                 height: 80px;
                 background-image: url('${imageUrl}');
                 background-size: cover;
                 background-position: center;
                 border: 2px solid #ccc;
                 border-radius: 4px;
                 cursor: pointer;
                 margin-right: 10px;
                 vertical-align: top;
               ">
        <label for="card-${index}" style="display: block; cursor: pointer; font-size: 14px; font-weight: bold; line-height: 1.2;">
          ${labelContent}
        </label>
      </div>
    `;
  });
    
    html += `
            </div>
            <div class="selection-buttons">
                <button onclick="yugiohGame.confirmCardTransfer('${sourceLocation}', '${destinationLocation}')">OK</button>
                <button onclick="this.closest('.card-selection-popup').remove()">Cancel</button>
            </div>
        </div>
    `;
    popup.innerHTML = html;
    popup.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2100;';
    document.body.appendChild(popup);
    console.log('Popup appended');

    // Attach filters after append
    const filterButtons = popup.querySelectorAll('.filter-btn');
    const selectableCards = popup.querySelectorAll('.selectable-card');
    console.log(`Found ${filterButtons.length} filter buttons, ${selectableCards.length} cards`);

    filterButtons.forEach(btn => {
        console.log('Attaching listener to button:', btn.dataset.type);
        btn.addEventListener('click', (e) => {
            console.log('Filter clicked:', btn.dataset.type);
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterType = btn.dataset.type;
            let hiddenCount = 0;
            selectableCards.forEach(cardEl => {
                const cardType = cardEl.dataset.type;
                if (filterType === 'all' || filterType === cardType) {
                    cardEl.classList.remove('hidden');
                } else {
                    cardEl.classList.add('hidden');
                    hiddenCount++;
                }
            });
            console.log(`Hidden ${hiddenCount} cards for filter ${filterType}`);
        });
    });
    console.log('Filter listeners attached');

   // Add Sort A-Z functionality
const sortButton = popup.querySelector('#sort-az-btn');
if (sortButton) {
    sortButton.addEventListener('click', () => {
        event.preventDefault();  // Prevent form submission or navigation;
         event.stopPropagation();
        const container = popup.querySelector('.card-selection');
        const cards = Array.from(container.querySelectorAll('.selectable-card'));

        cards.sort((a, b) => {
            const nameA = a.querySelector('label').textContent.trim().toLowerCase();
            const nameB = b.querySelector('label').textContent.trim().toLowerCase();
            return nameA.localeCompare(nameB);
        });

        container.innerHTML = '';
        cards.forEach(card => container.appendChild(card));
        console.log('Cards sorted A–Z');
    });
}

    
}


    getCardsFromLocation(location) {
        switch (location) {
            case 'hand1': return this.hand[0];
            case 'hand2': return this.hand[1];
            case 'graveyard1': return this.grave[0];
            case 'graveyard2': return this.grave[1];
            case 'monsterfield1': return this.monsterField[0];
            case 'monsterfield2': return this.monsterField[1];
            case 'spelltrapfield1': return this.spellTrapField[0];
            case 'spelltrapfield2': return this.spellTrapField[1];
            case 'deck1': return this.deck[0];
            case 'deck2': return this.deck[1];
            default: return [];
        }
    }

    // Enhanced card transfer with face-up/face-down choice for field cards
    confirmCardTransfer(sourceLocation, destinationLocation) {
        const popup = document.querySelector('.card-selection-popup');
        const selectedIndices = [];
        const checkboxes = popup.querySelectorAll('input[type="checkbox"]:checked');

        checkboxes.forEach(cb => {
            selectedIndices.push(parseInt(cb.id.split('-')[1]));
        });

        if (selectedIndices.length === 0) {
            alert('Please select at least one card!');
            return;
        }

        // If destination is field, ask for face-up/face-down choice
        if (destinationLocation.includes('field')) {
            this.showFieldPlacementChoice(selectedIndices, sourceLocation, destinationLocation);
        } else {
            this.executeCardTransfer(selectedIndices, sourceLocation, destinationLocation, true, 'attack');
        }
    }

    // Show face-up/face-down choice popup for field placement
    showFieldPlacementChoice(selectedIndices, sourceLocation, destinationLocation) {
        const choicePopup = document.createElement('div');
        choicePopup.className = 'field-choice-popup';
        choicePopup.innerHTML = `
            <div class="popup-content" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; max-width: 400px; color: white;">
                <div class="popup-header" style="text-align: center; margin-bottom: 25px;">
                    <h3>Field Placement</h3>
                </div>
                <div class="choice-buttons" style="display: flex; flex-direction: column; gap: 15px;">
                    <button onclick="yugiohGame.executeCardTransfer(${JSON.stringify(selectedIndices)}, '${sourceLocation}', '${destinationLocation}', true, 'attack')" 
                            style="background: #27ae60; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 16px; cursor: pointer;">
                        Face-Up (Attack Position)
                    </button>
                    <button onclick="yugiohGame.executeCardTransfer(${JSON.stringify(selectedIndices)}, '${sourceLocation}', '${destinationLocation}', false, 'defense')" 
                            style="background: #e67e22; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 16px; cursor: pointer;">
                        Face-Down (Defense Position)
                    </button>
                    <button onclick="this.closest('.field-choice-popup').remove()" 
                            style="background: #95a5a6; color: white; border: none; padding: 10px; border-radius: 8px; font-size: 14px; cursor: pointer;">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        choicePopup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2200;
        `;

        document.body.appendChild(choicePopup);
    }

    // Execute card transfer with specified face-up/face-down state
    executeCardTransfer(selectedIndices, sourceLocation, destinationLocation, faceUp, position) {
        // Close all popups
        document.querySelectorAll('.card-selection-popup, .bring-cards-popup, .field-choice-popup').forEach(popup => popup.remove());

        const sourceCards = this.getCardsFromLocation(sourceLocation);
        const destinationCards = this.getCardsFromLocation(destinationLocation);

        // Sort indices in descending order
        selectedIndices.sort((a, b) => b - a);

        selectedIndices.forEach(index => {
            const card = sourceCards.splice(index, 1)[0];

            // Restore original stats when leaving field
            if ((sourceLocation.includes('monsterfield') || sourceLocation.includes('spelltrapfield')) &&
                this.getCardType(card) === 'monster') {
                if (card.originalAk !== undefined) {
                    card.ak = card.originalAk;
                }
                if (card.originalDf !== undefined) {
                    card.df = card.originalDf;
                }
                console.log(`${card.cn} stats restored when leaving field`);
            }

            // Set up card for new location
            if (destinationLocation.includes('field')) {
                card.position = position;
                card.faceUp = faceUp;

                // Store original values if not already stored
                if (this.getCardType(card) === 'monster') {
                    if (!card.originalAk) card.originalAk = card.ak;
                    if (!card.originalDf) card.originalDf = card.df;
                }

                // Play audio when brought to field face-up
                if (faceUp) {
                    this.playCardAudio(card);
                }
            }

            destinationCards.push(card);
        });

        // If destination is deck, reshuffle
        if (destinationLocation === 'deck1') {
            this.shuffleDeck(0);
        } else if (destinationLocation === 'deck2') {
            this.shuffleDeck(1);
        }

        this.updateDisplay();
        this.displayAllCards();

        console.log(`Transferred ${selectedIndices.length} cards from ${sourceLocation} to ${destinationLocation}`);
    }

    // Card Modification Popup (unchanged)
    showCardModificationPopup(card, playerIndex) {


        const popup = document.createElement('div');
        popup.className = 'card-modification-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>Modify ${card.cn}</h3>
                    <button class="close-popup" onclick="this.closest('.card-modification-popup').remove()">×</button>
                </div>
                <div class="modification-layout">
    <div class="card-display-section">
      <div class="big-card-display" id="popup-big-card-${card.cn}">
        <!-- JS will render the full card here using your card renderer -->
        
      </div>
                        <div class="card-description">
                            <textarea readonly>${card.desc || 'No description available.'}</textarea>
                        </div>
                    </div>
                    <div class="modification-section">
                        <div class="stat-modifier">
                            <h4>Attack</h4>
                            <div class="plus-minus-buttons">
                                <button id="atk-minus" class="active">−</button>
                                <button id="atk-plus">+</button>
                            </div>
                            <div class="value-buttons">
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'ak', 1000)">1000</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'ak', 500)">500</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'ak', 100)">100</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'ak', 50)">50</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'ak', 1)">1</button>
                            </div>
                            <div class="current-value">Current ATK: <span id="current-atk">${card.ak || 0}</span></div>
                        </div>
                        <div class="stat-modifier">
                            <h4>Defense</h4>
                            <div class="plus-minus-buttons">
                                <button id="def-minus" class="active">−</button>
                                <button id="def-plus">+</button>
                            </div>
                            <div class="value-buttons">
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'df', 1000)">1000</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'df', 500)">500</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'df', 100)">100</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'df', 50)">50</button>
                                <button onclick="yugiohGame.modifyCardStat('${card.cn}', ${playerIndex}, 'df', 1)">1</button>
                            </div>
                            <div class="current-value">Current DEF: <span id="current-def">${card.df || 0}</span></div>
                        </div>
                        <button class="confirm-button" onclick="this.closest('.card-modification-popup').remove()">OK</button>
                    </div>
                </div>
            </div>
            
        `;


        //attack and defense modify
        popup.style.cssText = `
            top: 48%;
            width: 98%;
            height: 63%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: start-flex;
            z-index: 2000;
        `;



        document.body.appendChild(popup);
        this.setupStatModifierButtons(popup);
        const cardDisplayDiv = document.getElementById('popup-big-card-' + card.cn);
        cardDisplayDiv.appendChild(this.createYuGiOhCard(card, 0, playerIndex, 'field'));


    }

    setupStatModifierButtons(popup) {
        const atkMinus = popup.querySelector('#atk-minus');
        const atkPlus = popup.querySelector('#atk-plus');
        const defMinus = popup.querySelector('#def-minus');
        const defPlus = popup.querySelector('#def-plus');

        atkMinus.addEventListener('click', () => {
            atkMinus.classList.add('active');
            atkPlus.classList.remove('active');
        });

        atkPlus.addEventListener('click', () => {
            atkPlus.classList.add('active');
            atkMinus.classList.remove('active');
        });

        defMinus.addEventListener('click', () => {
            defMinus.classList.add('active');
            defPlus.classList.remove('active');
        });

        defPlus.addEventListener('click', () => {
            defPlus.classList.add('active');
            defMinus.classList.remove('active');
        });
    }

    modifyCardStat(cardName, playerIndex, stat, amount) {
        const popup = document.querySelector('.card-modification-popup');
        let isPlus;

        if (stat === 'ak') {
            isPlus = popup.querySelector('#atk-plus').classList.contains('active');
        } else {
            isPlus = popup.querySelector('#def-plus').classList.contains('active');
        }

        const finalAmount = isPlus ? amount : -amount;

        let foundCard = null;
        const locations = [this.hand[playerIndex], this.monsterField[playerIndex], this.spellTrapField[playerIndex]];

        for (let location of locations) {
            foundCard = location.find(card => card.cn === cardName);
            if (foundCard) break;
        }

        if (foundCard) {
            foundCard[stat] = Math.max(0, (foundCard[stat] || 0) + finalAmount);

            const display = popup.querySelector(stat === 'ak' ? '#current-atk' : '#current-def');
            display.textContent = foundCard[stat];

            this.displayAllCards();

            console.log(`${cardName} ${stat.toUpperCase()} modified by ${finalAmount} to ${foundCard[stat]}`);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        const player1LP = document.getElementById('player1LP');
        const player2LP = document.getElementById('player2LP');

        if (player1LP) {
            player1LP.addEventListener('click', () => {
                if (this.bp && this.selectedAttacker && this.turn !== 1) {
                    this.directAttack();
                } else if (this.mp) {
                    this.showLPModificationPopup(0);
                }
            });
        }

        if (player2LP) {
            player2LP.addEventListener('click', () => {
                if (this.bp && this.selectedAttacker && this.turn === 1) {
                    this.directAttack();
                } else if (this.mp) {
                    this.showLPModificationPopup(1);
                }
            });
        }

        const mpButton = document.getElementById('mp-button');
        const bpButton = document.getElementById('bp-button');
        const epButton = document.getElementById('ep-button');

        const player2Graveyard = document.getElementById('player2-graveyard');
        const player1Graveyard = document.getElementById('player1-graveyard');

        if (mpButton) {
            mpButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.setMainPhase();
            });
        }

        if (bpButton) {
            bpButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.setBattlePhase();
            });
        }

        if (epButton) {
            epButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.setEndPhase();
            });

        const epButtonBottom = document.getElementById("ep-button-2");
     if (epButtonBottom) {
    epButtonBottom.addEventListener('click', (e) => {
        e.preventDefault();
        this.setEndPhase();
    });
}

        }

        // Transfer Direction Buttons
const transferP1Btn = document.getElementById('transfer-p1-btn');
const transferP2Btn = document.getElementById('transfer-p2-btn');
if (transferP1Btn) {
  transferP1Btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (this.activeTransferPlayer === 1) {
      // Deactivate
      this.activeTransferPlayer = null;
      transferP1Btn.classList.remove('active');
    } else {
      // Activate P1, deactivate P2
      this.activeTransferPlayer = 1;
      transferP1Btn.classList.add('active');
      transferP2Btn.classList.remove('active');
    }
    console.log('Transfer direction set to:', this.activeTransferPlayer || 'none');
  });
}
if (transferP2Btn) {
  transferP2Btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (this.activeTransferPlayer === 2) {
      // Deactivate
      this.activeTransferPlayer = null;
      transferP2Btn.classList.remove('active');
    } else {
      // Activate P2, deactivate P1
      this.activeTransferPlayer = 2;
      transferP2Btn.classList.add('active');
      transferP1Btn.classList.remove('active');
    }
    console.log('Transfer direction set to:', this.activeTransferPlayer || 'none');
  });
}

// Stat Modifier Buttons
const atkModBtn = document.getElementById('atk-mod-btn');
const defModBtn = document.getElementById('def-mod-btn');

if (atkModBtn) {
  // Init text
  atkModBtn.textContent = `+${this.atkModValue} ATK`;
  
  // Single click: toggle active
  atkModBtn.addEventListener('click', (e) => {
    e.preventDefault();
    this.activeAtkMod = !this.activeAtkMod;
    atkModBtn.classList.toggle('active', this.activeAtkMod);
    console.log(`ATK mod ${this.activeAtkMod ? 'activated' : 'deactivated'}`);
  });
  
  // Double click: open popup
  atkModBtn.addEventListener('dblclick', (e) => {
    e.preventDefault();
    this.showModValuePopup('atk');
  });
}

if (defModBtn) {
  // Init text
  defModBtn.textContent = `+${this.defModValue} DEF`;
  
  // Single click: toggle active
  defModBtn.addEventListener('click', (e) => {
    e.preventDefault();
    this.activeDefMod = !this.activeDefMod;
    defModBtn.classList.toggle('active', this.activeDefMod);
    console.log(`DEF mod ${this.activeDefMod ? 'activated' : 'deactivated'}`);
  });
  
  // Double click: open popup
  defModBtn.addEventListener('dblclick', (e) => {
    e.preventDefault();
    this.showModValuePopup('def');
  });
}



        if (player2Graveyard) {
            player2Graveyard.addEventListener('click', () => {
                this.showGraveyard(1);
            });
        }

        if (player1Graveyard) {
            player1Graveyard.addEventListener('click', () => {
                this.showGraveyard(0);
            });
        }

        console.log('Event listeners setup complete');
    }

    debugGameState() {
        console.log('=== FIXED GAME STATE DEBUG ===');
        console.log('Turn:', this.turnCounter, '- Current Player:', this.turn === 1 ? 'Player 1' : 'Player 2');
        console.log('Phase:', this.mp ? 'Main' : this.bp ? 'Battle' : 'End');
        console.log('Selected Attacker:', this.selectedAttacker ? this.selectedAttacker.card.cn : 'None');
        console.log('Selected Target:', this.selectedTarget ? this.selectedTarget.card.cn : 'None');
        console.log('Player 1 Hand:', this.hand[0].map(c => c.cn));
        console.log('Player 2 Hand:', this.hand[1].map(c => c.cn));
        console.log('Player 1 Monsters:', this.monsterField[0].map(c => `${c.cn} (${c.ak}/${c.df}) - ${c.position}`));
        console.log('Player 2 Monsters:', this.monsterField[1].map(c => `${c.cn} (${c.ak}/${c.df}) - ${c.position}`));
        console.log('===================================');
    };

    debugGameState() {
        console.log('=== FIXED GAME STATE DEBUG ===');
        console.log('Turn:', this.turnCounter, '- Current Player:', this.turn === 1 ? 'Player 1' : 'Player 2');
        console.log('Phase:', this.mp ? 'Main' : this.bp ? 'Battle' : 'End');
        console.log('Selected Attacker:', this.selectedAttacker ? this.selectedAttacker.card.cn : 'None');
        console.log('Selected Target:', this.selectedTarget ? this.selectedTarget.card.cn : 'None');
        console.log('Player 1 Hand:', this.hand[0].map(c => c.cn));
        console.log('Player 2 Hand:', this.hand[1].map(c => c.cn));
        console.log('Player 1 Monsters:', this.monsterField[0].map(c => `${c.cn} (${c.ak}/${c.df}) - ${c.position}`));
        console.log('Player 2 Monsters:', this.monsterField[1].map(c => `${c.cn} (${c.ak}/${c.df}) - ${c.position}`));
        console.log('===================================');
    }






};

function initSimulator() {
    let intervalId = null;
    let currentValue = 0;
    let maxVal = 6;

    console.log('Simulator script initializing...');

    const simulatorButton = document.getElementById('simulator-button');
    if (!simulatorButton) {
        console.error('Simulator button not found!');
        return;
    }
    console.log('Simulator button found:', simulatorButton);

    const popup = document.createElement('div');
    popup.innerHTML = `
    <div id="simulator-popup" class="simulator-popup hidden">
      <div class="simulator-content">
        <button id="exit-simulator" class="close-popup">X</button>
        <div>
          <button id="choose-dice" class="simulator-option">Dice</button>
          <button id="choose-coin" class="simulator-option">Coin</button>
        </div>
        <div id="simulator-display" class="simulator-display">0</div>
        <button id="stop-simulator" class="stop-button" disabled>Stop</button>
      </div>
    </div>
  `;
    document.body.appendChild(popup);
    console.log('Simulator popup created and appended.');

    const simulatorPopup = document.getElementById('simulator-popup');
    const chooseDice = document.getElementById('choose-dice');
    const chooseCoin = document.getElementById('choose-coin');
    const display = document.getElementById('simulator-display');
    const stopButton = document.getElementById('stop-simulator');
    const exitButton = document.getElementById('exit-simulator');

    function resetDisplay() {
        console.log('Resetting display and clearing intervals.');
        display.textContent = '0';
        stopButton.disabled = true;
        clearInterval(intervalId);
        intervalId = null;
    }

    function startCycle(max) {
        console.log('Starting dice cycle with max value:', max);
        let value = 0;
        stopButton.disabled = false;
        intervalId = setInterval(() => {
            value = (value % max) + 1;
            display.textContent = value;
            currentValue = value;
        }, 100);
    }

    function startCoinCycle() {
        console.log('Starting coin cycle.');
        let value = 0;
        stopButton.disabled = false;
        intervalId = setInterval(() => {
            value = 1 - value; // toggle 0 and 1
            display.textContent = value;
            currentValue = value;
        }, 100);
    }

    simulatorButton.addEventListener('click', () => {
        console.log('Simulator button clicked.');
        simulatorPopup.classList.remove('hidden');
        resetDisplay();
    });

    chooseDice.addEventListener('click', () => {
        console.log('Dice option selected.');
        resetDisplay();
        maxVal = 6;
        startCycle(maxVal);
    });

    chooseCoin.addEventListener('click', () => {
        console.log('Coin option selected.');
        resetDisplay();
        startCoinCycle();
    });

    stopButton.addEventListener('click', () => {
        console.log('Stop button clicked.');
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            stopButton.disabled = true;
            console.log('Cycle stopped.');
        } else {
            console.log('No active cycle to stop.');
        }
    });

    exitButton.addEventListener('click', () => {
        console.log('Exit button clicked.');
        simulatorPopup.classList.add('hidden');
        resetDisplay();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initSimulator();
});

console.log('Fixed Yu-Gi-Oh Game Engine loaded successfully');

console.log('Fixed Yu-Gi-Oh Game Engine loaded successfully'); 