let analysisResults = [];
        let sentimentChart = null;
        let confidenceChart = null;

        // Spell checking dictionary and corrections
        const spellCheckDictionary = {
            'awsome': 'awesome', 'aweful': 'awful', 'recieve': 'receive', 'seperate': 'separate',
            'definately': 'definitely', 'occured': 'occurred', 'begining': 'beginning',
            'beleive': 'believe', 'acheive': 'achieve', 'wierd': 'weird', 'freind': 'friend',
            'thier': 'their', 'reccomend': 'recommend', 'neccessary': 'necessary',
            'embarass': 'embarrass', 'accomodate': 'accommodate', 'existance': 'existence',
            'maintainance': 'maintenance', 'occassion': 'occasion', 'priviledge': 'privilege',
            'rythm': 'rhythm', 'tommorrow': 'tomorrow', 'untill': 'until', 'usefull': 'useful',
            'gratefull': 'grateful', 'successfull': 'successful', 'beautifull': 'beautiful',
            'wonderfull': 'wonderful', 'carefull': 'careful', 'peacefull': 'peaceful',
            'powerfull': 'powerful', 'meaningfull': 'meaningful', 'painfull': 'painful',
            'helpfull': 'helpful', 'harmfull': 'harmful', 'faithfull': 'faithful',
            'doubtfull': 'doubtful', 'forgetfull': 'forgetful', 'respectfull': 'respectful',
            'dissapointed': 'disappointed', 'dissappointing': 'disappointing',
            'realy': 'really', 'finaly': 'finally', 'basicaly': 'basically',
            'actualy': 'actually', 'especialy': 'especially', 'generaly': 'generally',
            'usualy': 'usually', 'personaly': 'personally', 'originaly': 'originally',
            'totaly': 'totally', 'completly': 'completely', 'absolutly': 'absolutely',
            'extremly': 'extremely', 'incredibily': 'incredibly', 'amazinly': 'amazingly',
            'excelent': 'excellent', 'fantasic': 'fantastic', 'oustanding': 'outstanding',
            'brillant': 'brilliant', 'magnificient': 'magnificent', 'incredable': 'incredible',
            'terrable': 'terrible', 'horible': 'horrible', 'discusting': 'disgusting',
            'pathethic': 'pathetic', 'apalled': 'appalled', 'outragous': 'outrageous',
            'furius': 'furious', 'despize': 'despise', 'abismal': 'abysmal',
            'atrocous': 'atrocious', 'disapointing': 'disappointing', 'anoying': 'annoying',
            'frustating': 'frustrating', 'disapointed': 'disappointed', 'discusted': 'disgusted',
            'borring': 'boring', 'mediocore': 'mediocre', 'uninspireing': 'uninspiring',
            'forgetable': 'forgettable'
        };

        // Error handling utilities
        const ErrorHandler = {
            logError: function(error, context) {
                console.error(`[Sentiment Analysis Error] ${context}:`, error);
                this.showUserError(`An error occurred during ${context}. Please try again.`);
            },
            
            showUserError: function(message) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
                errorDiv.innerHTML = `
                    <div class="flex items-center">
                        <span class="mr-2">⚠️</span>
                        <span class="flex-1">${message}</span>
                        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-red-500 hover:text-red-700 text-xl">×</button>
                    </div>
                `;
                document.body.appendChild(errorDiv);
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.remove();
                    }
                }, 5000);
            },
            
            showUserSuccess: function(message) {
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
                successDiv.innerHTML = `
                    <div class="flex items-center">
                        <span class="mr-2">✅</span>
                        <span class="flex-1">${message}</span>
                        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-green-500 hover:text-green-700 text-xl">×</button>
                    </div>
                `;
                document.body.appendChild(successDiv);
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        successDiv.remove();
                    }
                }, 3000);
            },
            
            validateInput: function(text) {
                if (!text || typeof text !== 'string') {
                    throw new Error('Text must be a non-empty string');
                }
                if (text.trim().length === 0) {
                    throw new Error('Text cannot be empty or contain only whitespace');
                }
                if (text.length > 10000) {
                    throw new Error('Text is too long (maximum 10,000 characters)');
                }
                return true;
            },

            validateFile: function(file) {
                if (!file) {
                    throw new Error('No file selected');
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    throw new Error('File is too large (maximum 5MB)');
                }
                const allowedTypes = ['.csv', '.txt'];
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowedTypes.includes(fileExtension)) {
                    throw new Error('Invalid file type. Only CSV and TXT files are allowed');
                }
                return true;
            }
        };

        // Spell checking functions
        function checkSpelling(text) {
            try {
                const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
                const corrections = {};
                let correctedText = text;
                let correctionCount = 0;

                words.forEach(word => {
                    if (spellCheckDictionary[word]) {
                        corrections[word] = spellCheckDictionary[word];
                        const regex = new RegExp(`\\b${word}\\b`, 'gi');
                        correctedText = correctedText.replace(regex, (match) => {
                            correctionCount++;
                            if (match === match.toUpperCase()) {
                                return spellCheckDictionary[word].toUpperCase();
                            } else if (match[0] === match[0].toUpperCase()) {
                                return spellCheckDictionary[word].charAt(0).toUpperCase() + spellCheckDictionary[word].slice(1);
                            }
                            return spellCheckDictionary[word];
                        });
                    }
                });

                return {
                    originalText: text,
                    correctedText: correctedText,
                    corrections: corrections,
                    correctionCount: correctionCount,
                    hasCorrections: correctionCount > 0
                };
            } catch (error) {
                ErrorHandler.logError(error, 'spell checking');
                return {
                    originalText: text,
                    correctedText: text,
                    corrections: {},
                    correctionCount: 0,
                    hasCorrections: false
                };
            }
        }

        function showSpellCheckResults(spellCheckResult) {
            if (!spellCheckResult.hasCorrections) {
                ErrorHandler.showUserSuccess('No spelling errors found!');
                return;
            }

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                    <h3 class="text-xl font-semibold mb-4 text-gray-800">🔍 Spell Check Results</h3>
                    <p class="text-sm text-gray-600 mb-4">Found ${spellCheckResult.correctionCount} potential spelling corrections:</p>
                    
                    <div class="space-y-2 mb-6 max-h-32 overflow-y-auto">
                        ${Object.entries(spellCheckResult.corrections).map(([wrong, correct]) => `
                            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                <span class="text-red-600 line-through">${wrong}</span>
                                <span class="text-gray-400">→</span>
                                <span class="text-green-600 font-medium">${correct}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg mb-4 max-h-32 overflow-y-auto">
                        <p class="text-sm font-medium text-gray-700 mb-2">Corrected text:</p>
                        <p class="text-gray-800 text-sm">${spellCheckResult.correctedText}</p>
                    </div>
                    
                    <div class="flex gap-3 justify-end">
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                            Keep Original
                        </button>
                        <button onclick="acceptSpellCorrections(\`${spellCheckResult.correctedText.replace(/`/g, '\\`')}\`); this.closest('.fixed').remove()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Use Corrected Text
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function acceptSpellCorrections(correctedText) {
            try {
                document.getElementById('textInput').value = correctedText;
                ErrorHandler.showUserSuccess('Spelling corrections applied successfully!');
            } catch (error) {
                ErrorHandler.logError(error, 'applying spell corrections');
            }
        }

        function performSpellCheck() {
            try {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    ErrorHandler.showUserError('Please enter some text to check spelling.');
                    return;
                }
                
                ErrorHandler.validateInput(text);
                const spellCheckResult = checkSpelling(text);
                showSpellCheckResults(spellCheckResult);
            } catch (error) {
                ErrorHandler.logError(error, 'spell checking');
            }
        }

        function checkSpellingAndAnalyze() {
            try {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    ErrorHandler.showUserError('Please enter some text to analyze.');
                    return;
                }

                ErrorHandler.validateInput(text);
                const spellCheckResult = checkSpelling(text);
                
                if (spellCheckResult.hasCorrections) {
                    // Show spell check modal with option to proceed with analysis
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                    modal.innerHTML = `
                        <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                            <h3 class="text-xl font-semibold mb-4 text-gray-800">🔍 Spelling Issues Detected</h3>
                            <p class="text-sm text-gray-600 mb-4">Found ${spellCheckResult.correctionCount} potential spelling errors. How would you like to proceed?</p>
                            
                            <div class="space-y-2 mb-6 max-h-24 overflow-y-auto">
                                ${Object.entries(spellCheckResult.corrections).slice(0, 5).map(([wrong, correct]) => `
                                    <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg text-sm">
                                        <span class="text-red-600 line-through">${wrong}</span>
                                        <span class="text-gray-400">→</span>
                                        <span class="text-green-600 font-medium">${correct}</span>
                                    </div>
                                `).join('')}
                                ${Object.keys(spellCheckResult.corrections).length > 5 ? `<p class="text-xs text-gray-500 text-center">...and ${Object.keys(spellCheckResult.corrections).length - 5} more</p>` : ''}
                            </div>
                            
                            <div class="flex gap-3 justify-end">
                                <button onclick="analyzeSingleText(); this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                    Analyze Original
                                </button>
                                <button onclick="acceptSpellCorrections(\`${spellCheckResult.correctedText.replace(/`/g, '\\`')}\`); setTimeout(() => analyzeSingleText(), 100); this.closest('.fixed').remove()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                    Fix & Analyze
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                } else {
                    analyzeSingleText();
                }
            } catch (error) {
                ErrorHandler.logError(error, 'text analysis');
            }
        }

        // Enhanced sentiment analysis engine
        const sentimentLexicon = {
            positive: {
                strong: ['amazing', 'excellent', 'fantastic', 'outstanding', 'brilliant', 'magnificent', 'incredible', 'marvelous', 'superb', 'phenomenal', 'extraordinary', 'exceptional'],
                moderate: ['good', 'great', 'wonderful', 'perfect', 'best', 'awesome', 'beautiful', 'lovely', 'nice', 'pleased', 'satisfied', 'happy', 'delightful', 'impressive'],
                mild: ['okay', 'fine', 'decent', 'acceptable', 'adequate', 'reasonable', 'fair', 'pleasant', 'comfortable', 'solid']
            },
            negative: {
                strong: ['terrible', 'awful', 'horrible', 'disgusting', 'pathetic', 'appalled', 'outraged', 'devastated', 'furious', 'despise', 'abysmal', 'atrocious'],
                moderate: ['bad', 'hate', 'worst', 'disappointing', 'poor', 'useless', 'annoying', 'frustrating', 'angry', 'sad', 'upset', 'disappointed', 'disgusted'],
                mild: ['meh', 'boring', 'dull', 'bland', 'mediocre', 'lackluster', 'uninspiring', 'forgettable', 'average', 'subpar']
            },
            intensifiers: ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'quite', 'rather', 'somewhat'],
            negators: ['not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor', 'hardly', 'barely', 'scarcely']
        };

        function analyzeSentiment(text) {
            try {
                ErrorHandler.validateInput(text);
                
                const words = text.toLowerCase().match(/\b\w+\b/g) || [];
                let positiveScore = 0;
                let negativeScore = 0;
                let sentimentWords = [];
                let intensifierMultiplier = 1;
                let negationActive = false;

                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    const prevWord = i > 0 ? words[i - 1] : '';
                    
                    // Check for intensifiers
                    if (sentimentLexicon.intensifiers.includes(word)) {
                        intensifierMultiplier = 1.5;
                        continue;
                    }
                    
                    // Check for negators
                    if (sentimentLexicon.negators.includes(word)) {
                        negationActive = true;
                        continue;
                    }

                    // Check sentiment words
                    let wordScore = 0;
                    let wordType = '';
                    
                    if (sentimentLexicon.positive.strong.includes(word)) {
                        wordScore = 3;
                        wordType = 'positive';
                    } else if (sentimentLexicon.positive.moderate.includes(word)) {
                        wordScore = 2;
                        wordType = 'positive';
                    } else if (sentimentLexicon.positive.mild.includes(word)) {
                        wordScore = 1;
                        wordType = 'positive';
                    } else if (sentimentLexicon.negative.strong.includes(word)) {
                        wordScore = 3;
                        wordType = 'negative';
                    } else if (sentimentLexicon.negative.moderate.includes(word)) {
                        wordScore = 2;
                        wordType = 'negative';
                    } else if (sentimentLexicon.negative.mild.includes(word)) {
                        wordScore = 1;
                        wordType = 'negative';
                    }

                    if (wordScore > 0) {
                        // Apply intensifier
                        wordScore *= intensifierMultiplier;
                        
                        // Apply negation (flip sentiment)
                        if (negationActive) {
                            wordType = wordType === 'positive' ? 'negative' : 'positive';
                            negationActive = false;
                        }
                        
                        // Add to scores
                        if (wordType === 'positive') {
                            positiveScore += wordScore;
                        } else {
                            negativeScore += wordScore;
                        }
                        
                        sentimentWords.push({word, type: wordType, score: wordScore});
                        intensifierMultiplier = 1; // Reset intensifier
                    }
                    
                    // Reset negation after 2 words
                    if (negationActive && i > 0 && !sentimentLexicon.negators.includes(prevWord)) {
                        negationActive = false;
                    }
                }

                // Calculate sentiment and confidence
                const totalScore = positiveScore + negativeScore;
                const textLength = words.length;
                let sentiment, confidence;

                if (totalScore === 0) {
                    sentiment = 'neutral';
                    confidence = Math.max(0.3, Math.min(0.7, 0.5 + (textLength > 10 ? 0.1 : -0.1)));
                } else {
                    const sentimentRatio = Math.abs(positiveScore - negativeScore) / totalScore;
                    const densityFactor = Math.min(1, totalScore / textLength * 5); // Sentiment word density
                    
                    if (positiveScore > negativeScore) {
                        sentiment = 'positive';
                    } else if (negativeScore > positiveScore) {
                        sentiment = 'negative';
                    } else {
                        sentiment = 'neutral';
                    }
                    
                    // More sophisticated confidence calculation
                    confidence = Math.min(0.95, Math.max(0.5, 
                        0.5 + (sentimentRatio * 0.3) + (densityFactor * 0.2)
                    ));
                }

                return {
                    text: text,
                    sentiment: sentiment,
                    confidence: confidence,
                    positiveScore: positiveScore,
                    negativeScore: negativeScore,
                    sentimentWords: sentimentWords,
                    explanation: generateExplanation(sentiment, confidence, sentimentWords, totalScore, textLength)
                };
            } catch (error) {
                ErrorHandler.logError(error, 'sentiment analysis');
                return null;
            }
        }

        function generateExplanation(sentiment, confidence, sentimentWords, totalScore, textLength) {
            const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
            let explanation = `This text shows ${sentiment} sentiment with ${confidenceLevel} confidence (${(confidence * 100).toFixed(1)}%). `;
            
            if (sentimentWords.length > 0) {
                const positiveWords = sentimentWords.filter(w => w.type === 'positive');
                const negativeWords = sentimentWords.filter(w => w.type === 'negative');
                
                const positiveScore = positiveWords.reduce((sum, w) => sum + w.score, 0);
                const negativeScore = negativeWords.reduce((sum, w) => sum + w.score, 0);
                
                explanation += `Sentiment score: +${positiveScore.toFixed(1)} positive, -${negativeScore.toFixed(1)} negative. `;
                
                if (positiveWords.length > 0) {
                    const topPositive = positiveWords.sort((a, b) => b.score - a.score).slice(0, 3);
                    explanation += `Key positive terms: ${topPositive.map(w => `"${w.word}" (${w.score.toFixed(1)})`).join(', ')}. `;
                }
                if (negativeWords.length > 0) {
                    const topNegative = negativeWords.sort((a, b) => b.score - a.score).slice(0, 3);
                    explanation += `Key negative terms: ${topNegative.map(w => `"${w.word}" (${w.score.toFixed(1)})`).join(', ')}. `;
                }
                
                const density = (totalScore / textLength * 100).toFixed(1);
                explanation += `Sentiment density: ${density}% of words carry emotional weight.`;
            } else {
                explanation += 'No strong sentiment indicators found, suggesting neutral tone based on lack of emotional language.';
            }
            
            return explanation;
        }

        function highlightSentimentWords(text, sentimentWords) {
            let highlightedText = text;
            sentimentWords.forEach(({word, type}) => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const className = type === 'positive' ? 'bg-green-200' : 'bg-red-200';
                highlightedText = highlightedText.replace(regex, `<span class="${className} keyword-highlight">${word}</span>`);
            });
            return highlightedText;
        }

        function analyzeSingleText() {
            try {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    ErrorHandler.showUserError('Please enter some text to analyze.');
                    return;
                }

                const result = analyzeSentiment(text);
                if (result) {
                    analysisResults = [result];
                    displayResults();
                    ErrorHandler.showUserSuccess('Text analysis completed successfully!');
                }
            } catch (error) {
                ErrorHandler.logError(error, 'text analysis');
            }
        }

        function handleFileUpload(event) {
            try {
                const file = event.target.files[0];
                if (!file) return;

                ErrorHandler.validateFile(file);

                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const content = e.target.result;
                        let texts = [];

                        if (file.name.endsWith('.csv')) {
                            const lines = content.split('\n').filter(line => line.trim());
                            if (lines.length === 0) {
                                throw new Error('CSV file is empty');
                            }
                            texts = lines.slice(1).map(line => {
                                const columns = line.split(',');
                                return columns[columns.length - 1].replace(/"/g, '').trim();
                            }).filter(text => text && text.length > 0);
                        } else {
                            texts = content.split('\n').filter(line => line.trim() && line.trim().length > 0);
                        }

                        if (texts.length === 0) {
                            throw new Error('No valid text found in the file');
                        }

                        if (texts.length > 1000) {
                            throw new Error('Too many entries. Maximum 1000 texts allowed per file');
                        }

                        // Store for batch processing
                        window.uploadedTexts = texts;
                        ErrorHandler.showUserSuccess(`File loaded successfully! Found ${texts.length} text entries ready for analysis.`);
                    } catch (error) {
                        ErrorHandler.logError(error, 'file processing');
                    }
                };

                reader.onerror = function() {
                    ErrorHandler.showUserError('Failed to read the file. Please try again.');
                };

                reader.readAsText(file);
            } catch (error) {
                ErrorHandler.logError(error, 'file upload');
            }
        }

        function processBatchAnalysis() {
            try {
                if (!window.uploadedTexts || window.uploadedTexts.length === 0) {
                    ErrorHandler.showUserError('Please upload a file first.');
                    return;
                }

                const results = [];
                let processedCount = 0;
                let errorCount = 0;

                window.uploadedTexts.forEach((text, index) => {
                    try {
                        const result = analyzeSentiment(text);
                        if (result) {
                            results.push(result);
                            processedCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (error) {
                        console.warn(`Error processing text ${index + 1}:`, error);
                        errorCount++;
                    }
                });

                if (results.length === 0) {
                    ErrorHandler.showUserError('No texts could be processed successfully.');
                    return;
                }

                analysisResults = results;
                displayResults();
                
                let message = `Batch analysis completed! Processed ${processedCount} texts successfully.`;
                if (errorCount > 0) {
                    message += ` ${errorCount} texts had errors and were skipped.`;
                }
                ErrorHandler.showUserSuccess(message);
            } catch (error) {
                ErrorHandler.logError(error, 'batch analysis');
            }
        }

        function displayResults() {
            try {
                document.getElementById('resultsSection').classList.remove('hidden');

                // Update summary cards
                const positive = analysisResults.filter(r => r.sentiment === 'positive').length;
                const negative = analysisResults.filter(r => r.sentiment === 'negative').length;
                const neutral = analysisResults.filter(r => r.sentiment === 'neutral').length;

                document.getElementById('positiveCount').textContent = positive;
                document.getElementById('negativeCount').textContent = negative;
                document.getElementById('neutralCount').textContent = neutral;

                // Create charts
                createSentimentChart(positive, negative, neutral);
                createConfidenceChart();

                // Display detailed results
                displayDetailedResults();

                // Display keyword analysis
                displayKeywordAnalysis();
            } catch (error) {
                ErrorHandler.logError(error, 'displaying results');
            }
        }

        function createSentimentChart(positive, negative, neutral) {
            try {
                const ctx = document.getElementById('sentimentChart').getContext('2d');
                
                if (sentimentChart) {
                    sentimentChart.destroy();
                }

                const total = positive + negative + neutral;
                const hasData = total > 0;

                sentimentChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: hasData ? ['Positive', 'Negative', 'Neutral'] : ['No Data'],
                        datasets: [{
                            data: hasData ? [positive, negative, neutral] : [1],
                            backgroundColor: hasData ? ['#3b82f6', '#1e40af', '#60a5fa'] : ['#e5e7eb'],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 15,
                                    usePointStyle: true,
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (!hasData) return 'No analysis data';
                                        const label = context.label;
                                        const value = context.parsed;
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        },
                        cutout: '60%',
                        layout: {
                            padding: 10
                        }
                    }
                });
            } catch (error) {
                ErrorHandler.logError(error, 'creating sentiment chart');
            }
        }

        function createConfidenceChart() {
            try {
                const ctx = document.getElementById('confidenceChart').getContext('2d');
                
                if (confidenceChart) {
                    confidenceChart.destroy();
                }

                if (analysisResults.length === 0) {
                    // Show empty state
                    confidenceChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['No Data'],
                            datasets: [{
                                label: 'No Analysis Data',
                                data: [1],
                                backgroundColor: ['#e5e7eb'],
                                borderRadius: 8
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            aspectRatio: 1.8,
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false }
                            },
                            scales: {
                                y: { display: false },
                                x: { display: false }
                            },
                            layout: {
                                padding: 10
                            }
                        }
                    });
                    return;
                }

                const confidenceRanges = {
                    'High (80-100%)': 0,
                    'Medium (60-80%)': 0,
                    'Low (0-60%)': 0
                };

                const averageConfidences = {
                    'High (80-100%)': [],
                    'Medium (60-80%)': [],
                    'Low (0-60%)': []
                };

                analysisResults.forEach(result => {
                    if (result.confidence >= 0.8) {
                        confidenceRanges['High (80-100%)']++;
                        averageConfidences['High (80-100%)'].push(result.confidence);
                    } else if (result.confidence >= 0.6) {
                        confidenceRanges['Medium (60-80%)']++;
                        averageConfidences['Medium (60-80%)'].push(result.confidence);
                    } else {
                        confidenceRanges['Low (0-60%)']++;
                        averageConfidences['Low (0-60%)'].push(result.confidence);
                    }
                });

                confidenceChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(confidenceRanges),
                        datasets: [{
                            label: 'Number of Analyses',
                            data: Object.values(confidenceRanges),
                            backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa'],
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: ['#1d4ed8', '#2563eb', '#3b82f6']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.8,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const count = context.parsed.y;
                                        const total = analysisResults.length;
                                        const percentage = ((count / total) * 100).toFixed(1);
                                        const range = context.label;
                                        const avgConf = averageConfidences[range];
                                        const avgConfidence = avgConf.length > 0 ? 
                                            (avgConf.reduce((a, b) => a + b, 0) / avgConf.length * 100).toFixed(1) : 0;
                                        return [
                                            `Count: ${count} (${percentage}%)`,
                                            `Avg Confidence: ${avgConfidence}%`
                                        ];
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    font: {
                                        size: 10
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Number of Texts',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            x: {
                                ticks: {
                                    font: {
                                        size: 9
                                    },
                                    maxRotation: 0
                                }
                            }
                        },
                        layout: {
                            padding: 10
                        }
                    }
                });
            } catch (error) {
                ErrorHandler.logError(error, 'creating confidence chart');
            }
        }

        function displayDetailedResults() {
            try {
                const container = document.getElementById('detailedResults');
                container.innerHTML = '';

                analysisResults.forEach((result, index) => {
                    const sentimentColor = {
                        positive: 'text-blue-600 bg-blue-100',
                        negative: 'text-blue-800 bg-blue-200',
                        neutral: 'text-blue-500 bg-blue-50'
                    };

                    const sentimentEmoji = {
                        positive: '😊',
                        negative: '😞',
                        neutral: '😐'
                    };

                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'border border-gray-200 rounded-lg p-4';
                    resultDiv.innerHTML = `
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">${sentimentEmoji[result.sentiment]}</span>
                                <span class="px-3 py-1 rounded-full text-sm font-medium ${sentimentColor[result.sentiment]}">
                                    ${result.sentiment.toUpperCase()}
                                </span>
                                <span class="text-sm text-gray-500">
                                    Confidence: ${(result.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                            <span class="text-xs text-gray-400">#${index + 1}</span>
                        </div>
                        <div class="mb-3">
                            <p class="text-gray-800 leading-relaxed">${highlightSentimentWords(result.text, result.sentimentWords)}</p>
                        </div>
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <p class="text-sm text-blue-800"><strong>Analysis:</strong> ${result.explanation}</p>
                        </div>
                    `;
                    container.appendChild(resultDiv);
                });
            } catch (error) {
                ErrorHandler.logError(error, 'displaying detailed results');
            }
        }

        function displayKeywordAnalysis() {
            try {
                const container = document.getElementById('keywordAnalysis');
                container.innerHTML = '';

                // Aggregate keywords
                const positiveKeywords = {};
                const negativeKeywords = {};

                analysisResults.forEach(result => {
                    result.sentimentWords.forEach(({word, type}) => {
                        if (type === 'positive') {
                            positiveKeywords[word] = (positiveKeywords[word] || 0) + 1;
                        } else {
                            negativeKeywords[word] = (negativeKeywords[word] || 0) + 1;
                        }
                    });
                });

                // Display top keywords
                const createKeywordSection = (title, keywords, colorClass) => {
                    const sortedKeywords = Object.entries(keywords)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10);

                    const section = document.createElement('div');
                    section.innerHTML = `
                        <h4 class="font-semibold text-gray-800 mb-3">${title}</h4>
                        <div class="space-y-2">
                            ${sortedKeywords.map(([word, count]) => `
                                <div class="flex justify-between items-center p-2 ${colorClass} rounded-lg">
                                    <span class="font-medium">${word}</span>
                                    <span class="text-sm opacity-75">${count}x</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    return section;
                };

                if (Object.keys(positiveKeywords).length > 0) {
                    container.appendChild(createKeywordSection('🔵 Positive Keywords', positiveKeywords, 'bg-blue-100 text-blue-800'));
                }

                if (Object.keys(negativeKeywords).length > 0) {
                    container.appendChild(createKeywordSection('🔷 Negative Keywords', negativeKeywords, 'bg-blue-200 text-blue-900'));
                }

                if (Object.keys(positiveKeywords).length === 0 && Object.keys(negativeKeywords).length === 0) {
                    container.innerHTML = '<p class="text-gray-500 text-center py-8">No sentiment keywords detected in the analyzed text.</p>';
                }
            } catch (error) {
                ErrorHandler.logError(error, 'displaying keyword analysis');
            }
        }

        function exportResults(format) {
            try {
                if (analysisResults.length === 0) {
                    ErrorHandler.showUserError('No analysis results to export.');
                    return;
                }

                let content, filename, mimeType;

                switch (format) {
                    case 'csv':
                        content = 'Text,Sentiment,Confidence,Positive Score,Negative Score,Explanation\n';
                        content += analysisResults.map(r => 
                            `"${r.text.replace(/"/g, '""')}","${r.sentiment}","${r.confidence.toFixed(3)}","${r.positiveScore}","${r.negativeScore}","${r.explanation.replace(/"/g, '""')}"`
                        ).join('\n');
                        filename = 'sentiment_analysis.csv';
                        mimeType = 'text/csv';
                        break;

                    case 'json':
                        content = JSON.stringify(analysisResults, null, 2);
                        filename = 'sentiment_analysis.json';
                        mimeType = 'application/json';
                        break;

                    case 'pdf':
                        generatePDFReport();
                        return;
                }

                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                ErrorHandler.showUserSuccess(`${format.toUpperCase()} export completed successfully!`);
            } catch (error) {
                ErrorHandler.logError(error, 'exporting results');
            }
        }

        function generatePDFReport() {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Set up fonts and colors
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(20);
                doc.setTextColor(40, 40, 40);
                
                // Title
                doc.text('📊 Sentiment Analysis Report', 20, 30);
                
                // Subtitle
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);
                doc.text(`Total Analyses: ${analysisResults.length}`, 20, 50);
                
                // Summary section
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(40, 40, 40);
                doc.text('Summary', 20, 70);
                
                const summary = analysisResults.reduce((acc, r) => {
                    acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
                    return acc;
                }, {});
                
                let yPos = 85;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                
                Object.entries(summary).forEach(([sentiment, count]) => {
                    const percentage = ((count / analysisResults.length) * 100).toFixed(1);
                    
                    // Set color based on sentiment
                    if (sentiment === 'positive') {
                        doc.setTextColor(16, 185, 129);
                    } else if (sentiment === 'negative') {
                        doc.setTextColor(239, 68, 68);
                    } else {
                        doc.setTextColor(107, 114, 128);
                    }
                    
                    doc.text(`${sentiment.toUpperCase()}: ${count} (${percentage}%)`, 30, yPos);
                    yPos += 15;
                });
                
                // Detailed Results section
                yPos += 10;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(40, 40, 40);
                doc.text('Detailed Analysis', 20, yPos);
                yPos += 20;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                
                analysisResults.forEach((result, index) => {
                    // Check if we need a new page
                    if (yPos > 250) {
                        doc.addPage();
                        yPos = 30;
                    }
                    
                    // Result number and sentiment
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.setTextColor(40, 40, 40);
                    doc.text(`${index + 1}. ${result.sentiment.toUpperCase()}`, 20, yPos);
                    
                    // Confidence score
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`Confidence: ${(result.confidence * 100).toFixed(1)}%`, 120, yPos);
                    yPos += 10;
                    
                    // Text content (wrapped)
                    doc.setTextColor(60, 60, 60);
                    const textLines = doc.splitTextToSize(`Text: ${result.text}`, 170);
                    doc.text(textLines, 25, yPos);
                    yPos += textLines.length * 5 + 5;
                    
                    // Analysis explanation (wrapped)
                    doc.setTextColor(40, 40, 40);
                    const explanationLines = doc.splitTextToSize(`Analysis: ${result.explanation}`, 170);
                    doc.text(explanationLines, 25, yPos);
                    yPos += explanationLines.length * 5 + 15;
                });
                
                // Add keyword analysis if available
                const positiveKeywords = {};
                const negativeKeywords = {};
                
                analysisResults.forEach(result => {
                    result.sentimentWords.forEach(({word, type}) => {
                        if (type === 'positive') {
                            positiveKeywords[word] = (positiveKeywords[word] || 0) + 1;
                        } else {
                            negativeKeywords[word] = (negativeKeywords[word] || 0) + 1;
                        }
                    });
                });
                
                if (Object.keys(positiveKeywords).length > 0 || Object.keys(negativeKeywords).length > 0) {
                    // Check if we need a new page
                    if (yPos > 200) {
                        doc.addPage();
                        yPos = 30;
                    }
                    
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(16);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Top Keywords', 20, yPos);
                    yPos += 20;
                    
                    // Positive keywords
                    if (Object.keys(positiveKeywords).length > 0) {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(12);
                        doc.setTextColor(16, 185, 129);
                        doc.text('🟢 Positive Keywords:', 25, yPos);
                        yPos += 10;
                        
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        const topPositive = Object.entries(positiveKeywords)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10);
                        
                        topPositive.forEach(([word, count]) => {
                            doc.text(`• ${word} (${count}x)`, 30, yPos);
                            yPos += 8;
                        });
                        yPos += 5;
                    }
                    
                    // Negative keywords
                    if (Object.keys(negativeKeywords).length > 0) {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(12);
                        doc.setTextColor(239, 68, 68);
                        doc.text('🔴 Negative Keywords:', 25, yPos);
                        yPos += 10;
                        
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        const topNegative = Object.entries(negativeKeywords)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10);
                        
                        topNegative.forEach(([word, count]) => {
                            doc.text(`• ${word} (${count}x)`, 30, yPos);
                            yPos += 8;
                        });
                    }
                }
                
                // Save the PDF
                doc.save('sentiment_analysis_report.pdf');
                ErrorHandler.showUserSuccess('PDF report generated successfully!');
            } catch (error) {
                ErrorHandler.logError(error, 'PDF generation');
            }
        }