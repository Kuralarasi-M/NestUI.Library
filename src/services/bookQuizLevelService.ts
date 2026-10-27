// Service to generate progressive, multi-level book quizzes customizable by Country / Region.
// By default, it sets India / South Asia.
// Pulls real books from the user's library and cultural/classic literature knowledge to generate
// accessible, fun questions across unlimited levels (Level 1, Level 2, Level 3, etc.).

import { getAllBooks, type Book } from "./bookService";
import type { QuizQuestion } from "./quizService";

export interface RegionOption {
  id: string;
  name: string;
  flag: string;
  description: string;
}

export const QUIZ_REGIONS: RegionOption[] = [
  {
    id: "india",
    name: "India & South Asia",
    flag: "🇮🇳",
    description: "Indian epics, Rabindranath Tagore, R.K. Narayan, Premchand, Tamil classics & folklore",
  },
  {
    id: "uk",
    name: "UK & Europe",
    flag: "🇬🇧",
    description: "Shakespeare, Sherlock Holmes, Jane Austen, Charles Dickens, French & European classics",
  },
  {
    id: "americas",
    name: "Americas & World",
    flag: "🌎",
    description: "Mark Twain, Edgar Allan Poe, Hemingway, Gabriel García Márquez, Harper Lee & more",
  },
  {
    id: "all",
    name: "Global Mix",
    flag: "🌐",
    description: "Balanced rotation from timeless worldwide literature and international bestsellers",
  },
];

export interface ProgressiveBookQuiz {
  level: number;
  stageName: string;
  theme: string;
  region: string;
  questions: QuizQuestion[];
}

interface QuestionItem {
  question: string;
  correct: string;
  distractors: string[];
  theme: string;
  region: "india" | "uk" | "americas" | "global";
}

// Curated question bank categorized by Country/Region
const REGIONAL_LITERATURE_QUESTIONS: QuestionItem[] = [
  // --- INDIA & SOUTH ASIA ---
  {
    question: "Who was the first Asian Nobel Laureate in Literature, awarded for his poetic collection 'Gitanjali'?",
    correct: "Rabindranath Tagore",
    distractors: ["R.K. Narayan", "Sarojini Naidu", "Mulk Raj Anand"],
    theme: "Indian Classics",
    region: "india",
  },
  {
    question: "Which fictional South Indian town is the charming setting for R.K. Narayan's 'Swami and Friends' and 'Malgudi Days'?",
    correct: "Malgudi",
    distractors: ["Mayiladuthurai", "Anandnagar", "Sundarban"],
    theme: "Indian Literature",
    region: "india",
  },
  {
    question: "Who authored the monumental Tamil historical fiction masterpiece 'Ponniyin Selvan'?",
    correct: "Kalki Krishnamurthy",
    distractors: ["Jayakanthan", "Kannadasan", "Su. Venkatesan"],
    theme: "Tamil Literature",
    region: "india",
  },
  {
    question: "In the ancient epic Mahabharata, who is the author credited with composing the epic?",
    correct: "Sage Ved Vyasa",
    distractors: ["Sage Valmiki", "Kalidasa", "Tulsidas"],
    theme: "Indian Epics",
    region: "india",
  },
  {
    question: "Who composed the immortal ethical treatise 'Thirukkural' containing 1,330 couplets?",
    correct: "Thiruvalluvar",
    distractors: ["Avvaiyar", "Kambar", "Bharathiyar"],
    theme: "Tamil Classics",
    region: "india",
  },
  {
    question: "Which famous collection of animal fables was composed in ancient India by Vishnu Sharma to teach statecraft?",
    correct: "Panchatantra",
    distractors: ["Hitopadesha", "Jataka Tales", "Kathasaritsagara"],
    theme: "Folk Tales & Fables",
    region: "india",
  },
  {
    question: "Who wrote the celebrated Hindi novel 'Godan' (The Gift of a Cow)?",
    correct: "Munshi Premchand",
    distractors: ["Harivansh Rai Bachchan", "Phanishwar Nath Renu", "Jaishankar Prasad"],
    theme: "Hindi Literature",
    region: "india",
  },
  {
    question: "Who wrote the Booker Prize-winning novel 'The God of Small Things' set in Ayemenem, Kerala?",
    correct: "Arundhati Roy",
    distractors: ["Jhumpa Lahiri", "Kiran Desai", "Anita Desai"],
    theme: "Modern Indian Fiction",
    region: "india",
  },
  {
    question: "Which renowned poet composed patriotic Tamil anthems including 'Achamillai Achamillai'?",
    correct: "Subramania Bharati (Bharathiyar)",
    distractors: ["Bharathidasan", "Vairamuthu", "Kavimani Desigavinayagam"],
    theme: "Poetry & Freedom",
    region: "india",
  },
  {
    question: "Who wrote the autobiography 'The Story of My Experiments with Truth'?",
    correct: "Mahatma Gandhi",
    distractors: ["Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Subhas Chandra Bose"],
    theme: "Memoir & History",
    region: "india",
  },
  {
    question: "In Rudyard Kipling's 'The Jungle Book', what is the name of the ferocious Bengal tiger?",
    correct: "Shere Khan",
    distractors: ["Bagheera", "Baloo", "Kaa"],
    theme: "Indian Jungle Classics",
    region: "india",
  },
  {
    question: "Which classical Sanskrit dramatist wrote the famous romantic play 'Abhijnanasakuntalam'?",
    correct: "Kalidasa",
    distractors: ["Bhasa", "Bhavabhuti", "Sudraka"],
    theme: "Sanskrit Classics",
    region: "india",
  },

  // --- UK & EUROPE ---
  {
    question: "Who is the author of 'Romeo and Juliet', 'Macbeth', and 'Hamlet'?",
    correct: "William Shakespeare",
    distractors: ["Charles Dickens", "Mark Twain", "Jane Austen"],
    theme: "British Classics",
    region: "uk",
  },
  {
    question: "In 'Alice's Adventures in Wonderland', what does Alice follow down the rabbit hole?",
    correct: "The White Rabbit",
    distractors: ["The Cheshire Cat", "The Mad Hatter", "The Queen of Hearts"],
    theme: "Fantasy & Adventure",
    region: "uk",
  },
  {
    question: "Who wrote 'Frankenstein; or, The Modern Prometheus' in 1818?",
    correct: "Mary Shelley",
    distractors: ["Bram Stoker", "H.G. Wells", "Edgar Allan Poe"],
    theme: "Gothic & Sci-Fi",
    region: "uk",
  },
  {
    question: "What is the address of the resident detective Sherlock Holmes and Dr. Watson?",
    correct: "221B Baker Street",
    distractors: ["10 Downing Street", "4 Privet Drive", "742 Evergreen Terrace"],
    theme: "Mystery",
    region: "uk",
  },
  {
    question: "Who authored 'Pride and Prejudice' featuring Elizabeth Bennet and Mr. Darcy?",
    correct: "Jane Austen",
    distractors: ["Charlotte Brontë", "Emily Dickinson", "George Eliot"],
    theme: "Romance & Society",
    region: "uk",
  },
  {
    question: "Which Charles Dickens novel begins with 'It was the best of times, it was the worst of times'?",
    correct: "A Tale of Two Cities",
    distractors: ["Great Expectations", "Oliver Twist", "David Copperfield"],
    theme: "Historical Fiction",
    region: "uk",
  },
  {
    question: "Who is the legendary vampire count who travels from Transylvania to England?",
    correct: "Count Dracula",
    distractors: ["Count of Monte Cristo", "Victor Frankenstein", "Dorian Gray"],
    theme: "Horror & Gothic",
    region: "uk",
  },
  {
    question: "Who wrote 'The Picture of Dorian Gray'?",
    correct: "Oscar Wilde",
    distractors: ["Lord Byron", "Arthur Conan Doyle", "Thomas Hardy"],
    theme: "Classics",
    region: "uk",
  },
  {
    question: "In 'Treasure Island' by Robert Louis Stevenson, what is the name of the one-legged pirate?",
    correct: "Long John Silver",
    distractors: ["Captain Hook", "Blackbeard", "Captain Flint"],
    theme: "Pirates & Adventure",
    region: "uk",
  },
  {
    question: "Who authored 'The Metamorphosis', in which Gregor Samsa wakes up transformed into an insect?",
    correct: "Franz Kafka",
    distractors: ["Albert Camus", "Fyodor Dostoevsky", "Leo Tolstoy"],
    theme: "European Classics",
    region: "uk",
  },
  {
    question: "Who wrote the satirical Spanish masterpiece 'Don Quixote'?",
    correct: "Miguel de Cervantes",
    distractors: ["Gabriel García Márquez", "Dante Alighieri", "Federico García Lorca"],
    theme: "European Classics",
    region: "uk",
  },

  // --- AMERICAS & WORLD ---
  {
    question: "In 'The Adventures of Tom Sawyer', who is Tom's closest adventurous friend?",
    correct: "Huckleberry Finn",
    distractors: ["Becky Thatcher", "Joe Harper", "Injun Joe"],
    theme: "American Classics",
    region: "americas",
  },
  {
    question: "Who wrote the famous sea-faring adventure 'Moby-Dick'?",
    correct: "Herman Melville",
    distractors: ["Jack London", "Robert Louis Stevenson", "Jules Verne"],
    theme: "Adventure",
    region: "americas",
  },
  {
    question: "Who authored the classic American novel 'To Kill a Mockingbird'?",
    correct: "Harper Lee",
    distractors: ["Toni Morrison", "F. Scott Fitzgerald", "John Steinbeck"],
    theme: "American Literature",
    region: "americas",
  },
  {
    question: "What is the name of the loyal dog who journeys back into the Yukon wilderness in 'The Call of the Wild'?",
    correct: "Buck",
    distractors: ["White Fang", "Toto", "Lassie"],
    theme: "Adventure",
    region: "americas",
  },
  {
    question: "Who wrote the macabre gothic poem 'The Raven' ('Quoth the Raven, Nevermore')?",
    correct: "Edgar Allan Poe",
    distractors: ["Walt Whitman", "Robert Frost", "Nathaniel Hawthorne"],
    theme: "Poetry & Gothic",
    region: "americas",
  },
  {
    question: "Who wrote 'The Old Man and the Sea' and won the Nobel Prize in Literature?",
    correct: "Ernest Hemingway",
    distractors: ["William Faulkner", "John Steinbeck", "F. Scott Fitzgerald"],
    theme: "American Literature",
    region: "americas",
  },
  {
    question: "Which Colombian author pioneered magical realism with 'One Hundred Years of Solitude'?",
    correct: "Gabriel García Márquez",
    distractors: ["Jorge Luis Borges", "Pablo Neruda", "Mario Vargas Llosa"],
    theme: "Latin American Classics",
    region: "americas",
  },
  {
    question: "Who wrote 'The Great Gatsby', detailing the jazz age and the mysterious Jay Gatsby?",
    correct: "F. Scott Fitzgerald",
    distractors: ["Ernest Hemingway", "Sinclair Lewis", "John Dos Passos"],
    theme: "Jazz Age Classics",
    region: "americas",
  },
  {
    question: "Who wrote the monumental Russian epic novel 'War and Peace'?",
    correct: "Leo Tolstoy",
    distractors: ["Fyodor Dostoevsky", "Anton Chekhov", "Alexander Pushkin"],
    theme: "World Classics",
    region: "americas",
  },
  {
    question: "In Antoine de Saint-Exupéry's beloved tale, who does the narrator meet stranded in the Sahara desert?",
    correct: "The Little Prince",
    distractors: ["Sinbad the Sailor", "Don Quixote", "Aladdin"],
    theme: "Philosophy & Fable",
    region: "americas",
  },
];

// Generates dynamic questions directly from user's loaded library books
function generateQuestionsFromBooks(books: Book[]): QuizQuestion[] {
  if (!books || books.length < 4) return [];

  const shuffledBooks = [...books].sort(() => 0.5 - Math.random());
  const questions: QuizQuestion[] = [];

  shuffledBooks.slice(0, 5).forEach((book, idx) => {
    const otherAuthors = Array.from(
      new Set(
        books
          .filter((b) => b.author && b.author !== book.author)
          .map((b) => b.author)
      )
    ).slice(0, 3);

    if (otherAuthors.length === 3 && book.author && book.title) {
      const options = [book.author, ...otherAuthors].sort(() => 0.5 - Math.random());
      const correctOptionIndex = options.indexOf(book.author);

      questions.push({
        id: idx + 1000,
        category: "Library Collection",
        difficulty: "easy",
        question: `In your library collection, who is the author of "${book.title}"?`,
        options,
        correctOptionIndex,
      });
    }
  });

  return questions;
}

// Get progressive level challenge customized by region (Default: India)
export async function getProgressiveQuizLevel(
  level = 1,
  regionId = "india"
): Promise<ProgressiveBookQuiz> {
  const stageNames = [
    "Novice Bookworm",
    "Story Explorer",
    "Literary Scholar",
    "Master Storyteller",
    "Grand Archivist",
    "Immortal Reader",
  ];

  const stageName = stageNames[(level - 1) % stageNames.length] + ` (Level ${level})`;

  // Filter questions according to region
  let pool = REGIONAL_LITERATURE_QUESTIONS.filter((q) => {
    if (regionId === "all") return true;
    return q.region === regionId;
  });

  // Fallback to all if pool has fewer than 5
  if (pool.length < 5) {
    pool = REGIONAL_LITERATURE_QUESTIONS;
  }

  // Fetch local library books for dynamic contextual questions
  let libraryBooks: Book[] = [];
  try {
    libraryBooks = await getAllBooks();
  } catch {}

  const dynamicBookQs = generateQuestionsFromBooks(libraryBooks);

  // Rotate questions according to the level
  const startIndex = ((level - 1) * 5) % pool.length;
  const pickedPool: QuestionItem[] = [];

  for (let i = 0; i < 5; i++) {
    const qIndex = (startIndex + i) % pool.length;
    pickedPool.push(pool[qIndex]);
  }

  const questions: QuizQuestion[] = pickedPool.map((item, idx) => {
    const allOptions = [item.correct, ...item.distractors].sort(() => 0.5 - Math.random());
    const correctOptionIndex = allOptions.indexOf(item.correct);

    return {
      id: level * 100 + idx,
      category: item.theme,
      difficulty: level <= 2 ? "easy" : level <= 5 ? "medium" : "hard",
      question: item.question,
      options: allOptions,
      correctOptionIndex,
    };
  });

  // If we have dynamic library questions, weave 1-2 in every other level
  if (dynamicBookQs.length >= 2 && level % 2 === 0) {
    questions[1] = dynamicBookQs[0];
    questions[3] = dynamicBookQs[1];
  }

  const regionObj = QUIZ_REGIONS.find((r) => r.id === regionId) || QUIZ_REGIONS[0];

  return {
    level,
    stageName,
    theme: `${regionObj.flag} ${regionObj.name}`,
    region: regionId,
    questions,
  };
}
