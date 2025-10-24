class VirtualPet {
    constructor(name = 'Fluffy', type = 'dog') {
        this.hunger = 100;
        this.thirst = 100;
        this.happiness = 100;
        this.energy = 100;
        this.cleanliness = 100;
        this.loneliness = 0;
        
        this.poopLevel = 0;
        this.growth = 0;
        this.stage = 'Baby';
        this.stageHours = 0;
        this.totalAge = 0;
        this.gameTime = 0;
        
        this.isSleeping = false;
        this.isGameRunning = false;
        this.isDead = false;
        this.status = "Hello! I'm ready to play!";
        this.petType = type;
        this.petName = name;
        this.currentBackground = 'none';
        
        this.skills = {
            speak: false, roll: false, sit: false, stay: false,
            dance: false, fetch: false, spin: false, play_dead: false
        };
        
        this.playTimeSeconds = 0;
        this.lastUpdateTime = Date.now();
        this.gameHourInterval = 20000; // 20 seconds = 1 game hour
        this.statDecayPerHour = 5; // Stats decay by 5% per game hour
        
        this.sleepTimer = null;
        this.sleepDuration = 20000; // 20 seconds sleep
        
        this.updatePetImage();
    }
    
    startGame() {
        if (this.isGameRunning) {
            this.status = "Game is already running!";
            return;
        }
        
        if (this.isDead) {
            this.resetPet();
        }
        
        this.isGameRunning = true;
        this.lastUpdateTime = Date.now();
        this.status = `Hello! I'm ${this.petName} the ${this.petType}! Let's play!`;
    }
    
    resetPet() {
        this.hunger = 100;
        this.thirst = 100;
        this.happiness = 100;
        this.energy = 100;
        this.cleanliness = 100;
        this.loneliness = 0;
        
        this.poopLevel = 0;
        this.growth = 0;
        this.stage = 'Baby';
        this.stageHours = 0;
        this.totalAge = 0;
        this.gameTime = 0;
        
        this.isSleeping = false;
        this.isGameRunning = false;
        this.isDead = false;
        this.status = "I've been reset! Click Start Game to begin!";
        this.playTimeSeconds = 0;
        this.lastUpdateTime = Date.now();
        
        // Clear any existing sleep timer
        if (this.sleepTimer) {
            clearTimeout(this.sleepTimer);
            this.sleepTimer = null;
        }
        
        // Reset skills
        Object.keys(this.skills).forEach(skill => {
            this.skills[skill] = false;
        });
        
        this.updatePetImage();
        this.hideDeathOverlay();
        this.hideSleepTimer();
        this.updateDisplay();
    }
    
    updateStats() {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastUpdateTime;
        
        if (timeDiff >= this.gameHourInterval) {
            const hoursPassed = Math.floor(timeDiff / this.gameHourInterval);
            
            for (let i = 0; i < hoursPassed; i++) {
                this.hunger = Math.max(0, this.hunger - this.statDecayPerHour);
                this.thirst = Math.max(0, this.thirst - this.statDecayPerHour);
                this.happiness = Math.max(0, this.happiness - this.statDecayPerHour);
                this.energy = Math.max(0, this.energy - this.statDecayPerHour);
                this.cleanliness = Math.max(0, this.cleanliness - this.statDecayPerHour);
                this.loneliness = Math.min(100, this.loneliness + 0.5);
                this.poopLevel = Math.min(100, this.poopLevel + (this.statDecayPerHour / 2));
                
                this.totalAge++;
                this.stageHours++;
                
                this.updateGrowth();
            }
            
            this.lastUpdateTime = currentTime;
            
            // Update status messages based on current stats
            if (this.hunger <= 20) this.status = "I'm so hungry! Please feed me!";
            else if (this.thirst <= 20) this.status = "I'm very thirsty! Need water!";
            else if (this.happiness <= 20) this.status = "I'm really bored! Let's play!";
            else if (this.energy <= 20) this.status = "I'm exhausted... Need to sleep";
            else if (this.loneliness >= 80) this.status = "I'm so lonely... Need attention!";
            else if (this.poopLevel >= 80) this.status = "I really need to poop! Clean me!";
            else if (this.cleanliness <= 20) this.status = "I'm filthy! Need a bath!";
            else if (Math.random() < 0.3) {
                const messages = [
                    "I love being your pet!", 
                    "This is so much fun!", 
                    "You're the best owner!",
                    "I'm having a great time!",
                    "Life is good with you!"
                ];
                this.status = messages[Math.floor(Math.random() * messages.length)];
            }
            
            if (this.hunger <= 0 || this.thirst <= 0 || this.loneliness >= 100) {
                this.die();
            }
        }
    }
    
    updateGrowth() {
        if (this.stage === 'Elderly') return;
        
        const requirements = { 'Baby': 30, 'Child': 30, 'Teen': 30, 'Adult': 30, 'Elderly': Infinity };
        const currentReq = requirements[this.stage];
        this.growth = (this.stageHours / currentReq) * 100;
        
        if (this.stageHours >= currentReq) {
            this.evolve();
        }
    }
    
    evolve() {
        const stages = ['Baby', 'Child', 'Teen', 'Adult', 'Elderly'];
        const currentIndex = stages.indexOf(this.stage);
        if (currentIndex < stages.length - 1) {
            this.stage = stages[currentIndex + 1];
            this.stageHours = 0;
            this.growth = 0;
            this.status = `Wow! I evolved into a ${this.stage} ${this.petType}!`;
            this.updatePetImage();
        }
    }
    
    updatePetImage() {
        const petImg = document.getElementById('pet-img');
        if (petImg) {
            if (this.isDead) {
                petImg.src = 'images/ui/skull.png';
                petImg.alt = `${this.petName} has passed away`;
            } else {
                // Use the appropriate image based on pet type and stage
                const imagePath = `images/pets/${this.petType}/${this.stage.toLowerCase()}.png`;
                petImg.src = imagePath;
                petImg.alt = `${this.petName} the ${this.stage} ${this.petType}`;
            }
        }
    }
    
    updateDisplay() {
        // Update bars
        document.getElementById('hunger-bar').style.width = this.hunger + '%';
        document.getElementById('thirst-bar').style.width = this.thirst + '%';
        document.getElementById('happiness-bar').style.width = this.happiness + '%';
        document.getElementById('energy-bar').style.width = this.energy + '%';
        document.getElementById('cleanliness-bar').style.width = this.cleanliness + '%';
        document.getElementById('loneliness-bar').style.width = this.loneliness + '%';
        document.getElementById('growth-bar').style.width = this.growth + '%';
        
        // Update text
        document.getElementById('hunger-text').textContent = Math.round(this.hunger) + '%';
        document.getElementById('thirst-text').textContent = Math.round(this.thirst) + '%';
        document.getElementById('happiness-text').textContent = Math.round(this.happiness) + '%';
        document.getElementById('energy-text').textContent = Math.round(this.energy) + '%';
        document.getElementById('cleanliness-text').textContent = Math.round(this.cleanliness) + '%';
        document.getElementById('loneliness-text').textContent = Math.round(this.loneliness) + '%';
        document.getElementById('growth').textContent = this.stageHours;
        
        // Update info
        document.getElementById('stage').textContent = this.stage;
        document.getElementById('pet-stage').textContent = this.stage;
        document.getElementById('display-name').textContent = this.petName;
        document.getElementById('status').textContent = this.status;
        document.getElementById('pet-age').textContent = this.totalAge;
        document.getElementById('play-time').textContent = this.formatPlayTime(this.playTimeSeconds);
        
        // Update form fields
        document.getElementById('pet-type').value = this.petType;
        document.getElementById('pet-name').value = this.petName;
        document.getElementById('background-select').value = this.currentBackground;
        
        this.updatePetAppearance();
        this.updateSkills();
        this.changeBackground(this.currentBackground);
        this.checkPoop();
        this.updateLowStatWarnings();
        this.updateSleepButton();
    }
    
    updatePetAppearance() {
        const petImage = document.getElementById('pet-image');
        if (!petImage) return;
        
        petImage.className = 'pet-image';
        
        if (this.isDead) {
            petImage.classList.add('dead');
            this.showDeathOverlay();
        } else if (this.isSleeping) {
            petImage.classList.add('sleeping');
            this.showSleepTimer();
        } else {
            if (this.hunger <= 30) petImage.classList.add('hungry');
            if (this.thirst <= 30) petImage.classList.add('thirsty');
            if (this.energy <= 30) petImage.classList.add('tired');
            if (this.cleanliness <= 30) petImage.classList.add('dirty');
            if (this.stage === 'Elderly') petImage.classList.add('elderly');
        }
    }
    
    updateLowStatWarnings() {
        const stats = ['hunger', 'thirst', 'happiness', 'energy', 'cleanliness', 'loneliness'];
        stats.forEach(stat => {
            const bar = document.getElementById(`${stat}-bar`);
            const container = bar.closest('.stat');
            if (this[stat] <= 30) {
                container.classList.add('stat-low');
            } else {
                container.classList.remove('stat-low');
            }
        });
    }
    
    updateSleepButton() {
        const sleepButton = document.getElementById('sleep-button');
        if (sleepButton) {
            if (this.isSleeping) {
                sleepButton.innerHTML = '<img src="images/actions/sleep.png" alt="Sleep"> Wake Up';
                sleepButton.disabled = true;
            } else {
                sleepButton.innerHTML = '<img src="images/actions/sleep.png" alt="Sleep"> Sleep';
                sleepButton.disabled = false;
            }
        }
    }
    
    updateSkills() {
        Object.keys(this.skills).forEach(skill => {
            const element = document.getElementById(`skill-${skill}`);
            if (element) {
                if (this.skills[skill]) {
                    element.classList.add('learned');
                } else {
                    element.classList.remove('learned');
                }
            }
        });
    }
    
    checkPoop() {
        const poopAlert = document.getElementById('poop-alert');
        if (poopAlert) {
            poopAlert.style.display = this.poopLevel >= 50 && !this.isDead && !this.isSleeping ? 'flex' : 'none';
        }
    }
    
    showDeathOverlay() {
        const overlay = document.getElementById('death-overlay');
        const message = document.getElementById('death-message');
        if (overlay && message) {
            message.textContent = `${this.petName} has passed away`;
            overlay.style.display = 'block';
        }
    }
    
    hideDeathOverlay() {
        const overlay = document.getElementById('death-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    showSleepTimer() {
        let timerElement = document.getElementById('sleep-timer');
        if (!timerElement) {
            timerElement = document.createElement('div');
            timerElement.id = 'sleep-timer';
            timerElement.className = 'sleep-timer';
            document.getElementById('pet-image').appendChild(timerElement);
        }
        
        if (this.sleepTimer) {
            const timeLeft = this.sleepDuration - (Date.now() - this.sleepStartTime);
            const secondsLeft = Math.ceil(timeLeft / 1000);
            timerElement.textContent = `Zzz... ${secondsLeft}s`;
        }
    }
    
    hideSleepTimer() {
        const timerElement = document.getElementById('sleep-timer');
        if (timerElement) {
            timerElement.remove();
        }
    }
    
    createHeartEffect() {
        const petImage = document.getElementById('pet-image');
        const heart = document.createElement('div');
        heart.className = 'heart-effect';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 200 + 50 + 'px';
        petImage.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 2000);
    }
    
    useSkill(skillName) {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        if (this.skills[skillName]) {
            const skillMessages = {
                'speak': `${this.petName} says: "${this.petType === 'dog' ? 'Woof' : this.petType === 'cat' ? 'Meow' : 'Squeak'}!"`,
                'roll': `${this.petName} rolls over happily!`,
                'sit': `${this.petName} sits nicely for you!`,
                'stay': `${this.petName} stays perfectly still!`,
                'dance': `${this.petName} dances around joyfully!`,
                'fetch': `${this.petName} fetches the ball and brings it back!`,
                'spin': `${this.petName} spins in circles!`,
                'play_dead': `${this.petName} plays dead dramatically!`
            };
            
            this.status = skillMessages[skillName] || `${this.petName} performs ${skillName.replace('_', ' ')}!`;
            this.happiness = Math.min(100, this.happiness + 10);
            this.energy = Math.max(0, this.energy - 5);
        }
    }
    
    feed(foodType) {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        const effects = {
            'kibble': { hunger: 30 },
            'treat': { hunger: 20, happiness: 15 },
            'veggie': { hunger: 25, energy: 10 }
        };
        
        const effect = effects[foodType];
        this.hunger = Math.min(100, this.hunger + effect.hunger);
        if (effect.happiness) this.happiness = Math.min(100, this.happiness + effect.happiness);
        if (effect.energy) this.energy = Math.min(100, this.energy + effect.energy);
        
        this.poopLevel = Math.min(100, this.poopLevel + 15);
        this.status = `Yum! ${foodType}! Thank you!`;
        
        if (effect.happiness) {
            this.createHeartEffect();
        }
    }
    
    drink(drinkType) {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        const effects = {
            'water': { thirst: 35 },
            'milk': { thirst: 30, hunger: 10 },
            'juice': { thirst: 25, happiness: 10 }
        };
        
        const effect = effects[drinkType];
        this.thirst = Math.min(100, this.thirst + effect.thirst);
        if (effect.hunger) this.hunger = Math.min(100, this.hunger + effect.hunger);
        if (effect.happiness) this.happiness = Math.min(100, this.happiness + effect.happiness);
        
        this.status = `Refreshing ${drinkType}!`;
        
        if (effect.happiness) {
            this.createHeartEffect();
        }
    }
    
    playActivity(activityType) {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        if (this.energy < 20) {
            this.status = "I'm too tired to play right now...";
            return;
        }
        
        const effects = {
            'fetch': { happiness: 25, energy: -20 },
            'walk': { happiness: 20, energy: -15 },
            'toy': { happiness: 15, energy: -10 }
        };
        
        const effect = effects[activityType];
        this.happiness = Math.min(100, this.happiness + effect.happiness);
        this.energy = Math.max(0, this.energy + effect.energy);
        
        this.status = `Playing ${activityType} is so much fun!`;
        this.createHeartEffect();
        
        this.learnRandomSkill();
    }
    
    giveAffection(affectionType) {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        const effects = {
            'cuddle': { happiness: 20, loneliness: -25 },
            'hug': { happiness: 25, loneliness: -30 },
            'talk': { happiness: 15, loneliness: -20 }
        };
        
        const effect = effects[affectionType];
        this.happiness = Math.min(100, this.happiness + effect.happiness);
        this.loneliness = Math.max(0, this.loneliness + effect.loneliness);
        
        this.status = `I love ${affectionType}! You're the best!`;
        this.createHeartEffect();
    }
    
    clean() {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        this.cleanliness = 100;
        this.poopLevel = 0;
        this.status = "Ahh, much cleaner! Thank you!";
    }
    
    train() {
        if (!this.isGameRunning || this.isSleeping || this.isDead) return;
        
        if (this.energy < 30) {
            this.status = "I'm too tired to train right now...";
            return;
        }
        
        this.energy = Math.max(0, this.energy - 20);
        this.happiness = Math.min(100, this.happiness + 5);
        this.status = "Training is hard work but I'm learning!";
        
        this.learnRandomSkill();
    }
    
    sleep() {
        if (!this.isGameRunning || this.isDead || this.isSleeping) return;
        
        this.isSleeping = true;
        this.status = "Zzz... Good night...";
        this.sleepStartTime = Date.now();
        
        // Set timer to wake up automatically after 20 seconds
        this.sleepTimer = setTimeout(() => {
            this.wakeUp();
        }, this.sleepDuration);
        
        // Restore energy while sleeping
        this.energy = Math.min(100, this.energy + 30);
    }
    
    wakeUp() {
        this.isSleeping = false;
        this.status = "I'm awake! Let's play!";
        this.sleepTimer = null;
        this.hideSleepTimer();
        this.updateDisplay();
    }
    
    learnRandomSkill() {
        const availableSkills = Object.keys(this.skills).filter(skill => !this.skills[skill]);
        if (availableSkills.length > 0 && Math.random() < 0.25) {
            const skillToLearn = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            this.skills[skillToLearn] = true;
            this.status = `I learned a new skill: ${skillToLearn.replace('_', ' ')}!`;
        }
    }
    
    die() {
        this.isGameRunning = false;
        this.isDead = true;
        this.status = `${this.petName} has passed away... Press Reset Pet to start over.`;
        
        // Clear sleep timer if pet dies while sleeping
        if (this.sleepTimer) {
            clearTimeout(this.sleepTimer);
            this.sleepTimer = null;
        }
        
        this.updatePetImage();
        this.showDeathOverlay();
    }
    
    changeBackground(background) {
        this.currentBackground = background;
        const backgroundElement = document.getElementById('pet-background');
        if (backgroundElement) {
            backgroundElement.className = 'pet-display-background';
            if (background !== 'none') {
                backgroundElement.classList.add(background);
            }
        }
    }
    
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    }
}

let pet = new VirtualPet();

function initializeGame() {
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const petTypeSelect = document.getElementById('pet-type');
    const petNameInput = document.getElementById('pet-name');
    const backgroundSelect = document.getElementById('background-select');
    
    startButton.addEventListener('click', () => {
        const name = petNameInput.value.trim() || 'Fluffy';
        const type = petTypeSelect.value;
        
        if (!pet.isGameRunning) {
            pet = new VirtualPet(name, type);
            pet.startGame();
            pet.updateDisplay();
        } else {
            pet.status = "Game is already running!";
            pet.updateDisplay();
        }
    });
    
    resetButton.addEventListener('click', () => {
        pet.resetPet();
    });
    
    backgroundSelect.addEventListener('change', (e) => {
        pet.changeBackground(e.target.value);
    });
    
    // Update pet image when type changes
    petTypeSelect.addEventListener('change', function() {
        const name = petNameInput.value.trim() || 'Fluffy';
        const type = this.value;
        
        if (!pet.isGameRunning && !pet.isDead) {
            pet.petType = type;
            pet.petName = name;
            pet.updatePetImage();
            pet.updateDisplay();
        }
    });
    
    // Update pet name when input changes
    petNameInput.addEventListener('input', function() {
        const name = this.value.trim() || 'Fluffy';
        if (!pet.isGameRunning && !pet.isDead) {
            pet.petName = name;
            document.getElementById('display-name').textContent = name;
        }
    });
    
    // Pet image click for random affection
    document.getElementById('pet-image').addEventListener('click', () => {
        if (pet.isGameRunning && !pet.isSleeping && !pet.isDead) {
            pet.happiness = Math.min(100, pet.happiness + 5);
            pet.loneliness = Math.max(0, pet.loneliness - 10);
            pet.status = `${pet.petName} loves the attention!`;
            pet.createHeartEffect();
            pet.updateDisplay();
        }
    });
    
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.action-btn');
            const action = actionBtn.dataset.action;
            const type = actionBtn.dataset.type;
            
            if (!pet.isGameRunning) {
                pet.status = "Please start the game first!";
                pet.updateDisplay();
                return;
            }
            
            switch(action) {
                case 'feed':
                    pet.feed(type);
                    break;
                case 'drink':
                    pet.drink(type);
                    break;
                case 'playActivity':
                    pet.playActivity(type);
                    break;
                case 'giveAffection':
                    pet.giveAffection(type);
                    break;
                case 'clean':
                    pet.clean();
                    break;
                case 'train':
                    pet.train();
                    break;
                case 'sleep':
                    pet.sleep();
                    break;
            }
            
            pet.updateDisplay();
        });
    });
    
    document.querySelectorAll('.skill').forEach(skill => {
        skill.addEventListener('click', (e) => {
            const skillName = e.currentTarget.id.replace('skill-', '');
            pet.useSkill(skillName);
            pet.updateDisplay();
        });
    });
    
    // Game loop - update every second
    setInterval(() => {
        if (pet.isGameRunning) {
            pet.playTimeSeconds++;
            pet.updateStats();
            
            // Update sleep timer display
            if (pet.isSleeping) {
                pet.showSleepTimer();
            }
            
            pet.updateDisplay();
        }
    }, 1000);
    
    // Show initial pet image immediately
    pet.updatePetImage();
    pet.updateDisplay();
}

document.addEventListener('DOMContentLoaded', initializeGame);