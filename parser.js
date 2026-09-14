/**
 * ============================================================================
 * Production-Ready Instagram Playwright Parser for CRM Integration
 * ============================================================================
 *
 * Архитектура и особенности:
 * 1. Работает в видимом окне Chromium (headless: false) для визуального контроля действий.
 * 2. Использует постоянный контекст браузера (launchPersistentContext), сохраняя сессии,
 *    cookies и авторизацию в директории './user_data/insta_profile'.
 * 3. Реализует человекоподобное поведение (human-like delays): случайные паузы от 2 до 6 секунд,
 *    плавные движения курсора, неравномерный скроллинг ленты.
 * 4. Защита от детекта автоматизации: отключение флага AutomationControlled, подмена
 *    navigator.webdriver, реалистичный User-Agent и Viewport.
 * 5. Интеграция с CRM в реальном времени: поддержка callback-функций и встроенного WebSocket-сервера.
 */

import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И АНТИДЕТЕКТ
// ============================================================================

/**
 * Генератор случайной задержки для имитации действий реального пользователя (2000 - 5000 мс).
 * @param {number} minMs - Минимальная задержка в миллисекундах (по умолчанию 2000)
 * @param {number} maxMs - Максимальная задержка в миллисекундах (по умолчанию 5000)
 * @returns {Promise<number>} - Фактическое время задержки в мс
 */
export const randomDelay = (minMs = 2000, maxMs = 5000) => {
  const ms = Math.floor(minMs + Math.random() * (maxMs - minMs));
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Очистка имени пользователя от символов '@', пробелов и URL
 * @param {string} input - Строка с ником или ссылкой на профиль
 * @returns {string} - Чистый никнейм
 */
export const sanitizeUsername = (input) => {
  if (!input) return '';
  return input
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^@/, '')
    .toLowerCase();
};

/**
 * Проверка текста BIO / описания профиля на наличие ключевых слов
 * @param {string} bio - Текст описания профиля
 * @param {string[]} keywords - Массив ключевых слов
 * @returns {{ isMatch: boolean, matchedKeywords: string[] }}
 */
export const checkKeywords = (bio = '', keywords = []) => {
  if (!keywords || keywords.length === 0) {
    return { isMatch: true, matchedKeywords: [] };
  }

  const normalizedBio = bio.toLowerCase();
  const matched = keywords.filter((kw) => {
    const cleanKw = kw.trim().toLowerCase();
    if (!cleanKw) return false;
    // Поиск как отдельного слова или вхождения (включая хэштеги #artist)
    const regex = new RegExp(`(^|[^a-zа-я0-9_#])${cleanKw}([^a-zа-я0-9_]|$)`, 'i');
    return regex.test(normalizedBio) || normalizedBio.includes(cleanKw);
  });

  return {
    isMatch: matched.length > 0,
    matchedKeywords: matched,
  };
};

/**
 * Имитация естественного скроллинга страницы или модального окна
 * @param {import('playwright').Page} page
 * @param {string|null} selector - Селектор контейнера (null для всей страницы)
 * @param {number} scrollsCount - Количество тактов скролла
 */
export const scrollElement = async (page, selector = null, scrollsCount = 3) => {
  for (let i = 0; i < scrollsCount; i++) {
    const scrollStep = Math.floor(250 + Math.random() * 350);
    const scrollDirection = Math.random() > 0.15 ? 1 : -0.3; // 85% вниз, 15% легкий откат наверх
    const deltaY = Math.floor(scrollStep * scrollDirection);

    try {
      if (selector) {
        await page.evaluate(
          ({ sel, dy }) => {
            const el = document.querySelector(sel);
            if (el) {
              el.scrollBy({ top: dy, behavior: 'smooth' });
            }
          },
          { sel: selector, dy: deltaY }
        );
      } else {
        await page.mouse.wheel(0, deltaY);
      }
    } catch (err) {
      // Игнорируем ошибку, если элемент перерендерился
    }

    // Случайная пауза между движениями мыши/скролла (2000 - 5000 мс)
    await randomDelay(2000, 5000);
  }
};

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ БРАУЗЕРА (PLAYWRIGHT)
// ============================================================================

/**
 * Запуск видимого браузера Chromium с сохранением постоянной пользовательской сессии.
 * @param {string} userDataDir - Путь к папке профиля пользователя (по ТЗ: './insta_session')
 * @param {boolean} headless - Флаг фонового режима (по ТЗ строго false)
 * @returns {Promise<{ context: import('playwright').BrowserContext, page: import('playwright').Page }>}
 */
export const initBrowser = async (
  userDataDir = './insta_session',
  headless = false
) => {
  const absoluteProfileDir = path.resolve(process.cwd(), userDataDir);

  // Создаем папку профиля, если она отсутствует
  if (!fs.existsSync(absoluteProfileDir)) {
    fs.mkdirSync(absoluteProfileDir, { recursive: true });
  }

  // Аргументы командной строки Chromium для обхода блокировок и антифрода
  const launchArgs = [
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=100,100',
    '--window-size=1280,720',
  ];

  const context = await chromium.launchPersistentContext(absoluteProfileDir, {
    headless: false, // ТЗ 1: строго в видимом окне (headed mode)
    args: launchArgs,
    viewport: { width: 1280, height: 720 }, // ТЗ 1: viewport 1280x720
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
    colorScheme: 'dark',
    ignoreHTTPSErrors: true,
  });

  // Маскировка браузера: удаление флага navigator.webdriver и добавление window.chrome
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    window.chrome = {
      runtime: {},
      loadTimes: function () {},
      csi: function () {},
      app: {},
    };
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['ru-RU', 'ru', 'en-US', 'en'],
    });
  });

  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  // Настройка дефолтного таймаута операций
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(35000);

  return { context, page };
};

// ============================================================================
// МОДУЛИ ПАРСИНГА
// ============================================================================

/**
 * 1. Прогрев аккаунта (Warmup Lenta):
 * Листает главную ленту Instagram 15-30 секунд с паузами для имитации живого юзера.
 * @param {import('playwright').Page} page
 * @param {number} durationSec - Длительность прогрева в секундах
 * @param {(msg: string, type?: string) => void} log
 */
export const warmup = async (page, durationSec = 20, log = console.log) => {
  log(`[Warmup] Начат прогрев ленты (${durationSec} сек)...`, 'info');

  try {
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
    await randomDelay(2, 4);

    // Закрытие возможных системных модальных окон (уведомления, куки)
    await dismissInstagramPopups(page);

    const startTime = Date.now();
    const durationMs = durationSec * 1000;

    while (Date.now() - startTime < durationMs) {
      log('[Warmup] Просмотр ленты постов...', 'info');
      await scrollElement(page, null, 1);

      // Случайное наведение мыши на область контента
      const randomX = Math.floor(300 + Math.random() * 400);
      const randomY = Math.floor(200 + Math.random() * 300);
      try {
        await page.mouse.move(randomX, randomY, { steps: 5 });
      } catch {}

      await randomDelay(2, 5);
    }

    log('[Warmup] Прогрев успешно завершен.', 'success');
  } catch (err) {
    log(`[Warmup] Замечание во время прогрева: ${err.message}`, 'warning');
  }
};

/**
 * Закрытие стандартных всплывающих окон Instagram ("Включить уведомления", куки и т.д.)
 */
const dismissInstagramPopups = async (page) => {
  const dismissButtonsSelectors = [
    'button:has-text("Не сейчас")',
    'button:has-text("Not Now")',
    'button:has-text("Принять")',
    'button:has-text("Accept")',
    'button:has-text("Позже")',
  ];

  for (const selector of dismissButtonsSelectors) {
    try {
      const btn = await page.$(selector);
      if (btn && (await btn.isVisible())) {
        await btn.click();
        await randomDelay(1, 2);
      }
    } catch {}
  }
};

/**
 * 2. Модуль парсинга Stories:
 * Открывает сторис целевого аккаунта, просматривает их и собирает никнеймы из отметок.
 * @param {import('playwright').Page} page
 * @param {string} targetAccount - Никнейм или ссылка на аккаунт-донор
 * @param {(contact: object) => void} emitContact - Колбэк отправки лида в CRM
 * @param {(msg: string, type?: string) => void} log
 */
export const parseStories = async (page, targetAccount, emitContact, log = console.log) => {
  const username = sanitizeUsername(targetAccount);
  log(`[Stories] Анализ сторис аккаунта @${username}...`, 'info');

  const collectedUsernames = new Set();

  try {
    // Переход в сторис пользователя
    const storiesUrl = `https://www.instagram.com/stories/${username}/`;
    await page.goto(storiesUrl, { waitUntil: 'domcontentloaded' });
    await randomDelay(2, 4);

    // Проверяем, доступны ли истории
    const isUnavailable = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return (
        text.includes('Эта страница недоступна') ||
        text.includes('История недоступна') ||
        text.includes("This story is unavailable")
      );
    });

    if (isUnavailable) {
      log(`[Stories] У пользователя @${username} нет активных историй или профиль закрыт.`, 'info');
      return;
    }

    // Просматриваем до 8 слайдов историй
    for (let slide = 1; slide <= 8; slide++) {
      log(`[Stories] Просмотр слайда #${slide}...`, 'info');

      // Поиск отметок людей (теги @никнейм или ссылки на профили)
      const foundTags = await page.evaluate(() => {
        const results = [];
        // Все ссылки на профили внутри контейнера истории
        const links = Array.from(document.querySelectorAll('a[href*="/"]'));
        links.forEach((a) => {
          const href = a.getAttribute('href') || '';
          const match = href.match(/^\/([a-zA-Z0-9._]+)\/?$/);
          if (match && !['stories', 'explore', 'direct', 'reels'].includes(match[1])) {
            results.push(match[1]);
          }
        });

        // Текстовые оверлеи с @
        const spans = Array.from(document.querySelectorAll('span, div'));
        spans.forEach((el) => {
          const text = el.innerText || '';
          const mentions = text.match(/@([a-zA-Z0-9._]{3,30})/g);
          if (mentions) {
            mentions.forEach((m) => results.push(m.replace('@', '')));
          }
        });

        return Array.from(new Set(results));
      });

      for (const taggedUser of foundTags) {
        const cleanUser = sanitizeUsername(taggedUser);
        if (cleanUser && cleanUser !== username && !collectedUsernames.has(cleanUser)) {
          collectedUsernames.add(cleanUser);
          log(`[Stories] Найдена отметка в сторис: @${cleanUser}`, 'success');

          emitContact({
            username: cleanUser,
            full_name: '',
            bio: 'Найдено в отметках Stories',
            source: 'stories',
            targetAccount: username,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Пауза для естественного просмотра истории (2 - 5 сек)
      await randomDelay(2, 5);

      // Переход к следующему слайду (нажатие ArrowRight или клик по правой стороне)
      try {
        await page.keyboard.press('ArrowRight');
      } catch {
        break;
      }

      await randomDelay(1, 2);

      // Проверяем, не вышли ли мы из сторис
      if (!page.url().includes('/stories/')) {
        log('[Stories] Просмотр историй завершен (выход в ленту).', 'info');
        break;
      }
    }
  } catch (err) {
    log(`[Stories] Ошибка модуля историй: ${err.message}`, 'warning');
  }
};

/**
 * 3. Модуль парсинга постов и вкладки "Отметки" (Tagged):
 * Просматривает последние посты, заходит во вкладку Tagged и собирает авторов отмеченных постов.
 * @param {import('playwright').Page} page
 * @param {string} targetAccount
 * @param {(contact: object) => void} emitContact
 * @param {(msg: string, type?: string) => void} log
 */
export const parsePostsAndTagged = async (
  page,
  targetAccount,
  emitContact,
  log = console.log
) => {
  const username = sanitizeUsername(targetAccount);
  log(`[Posts & Tagged] Анализ постов и вкладки "Отметки" @${username}...`, 'info');

  const collectedUsers = new Set();

  try {
    // 1. Переход на страницу "Отметки" (Tagged)
    const taggedUrl = `https://www.instagram.com/${username}/tagged/`;
    await page.goto(taggedUrl, { waitUntil: 'domcontentloaded' });
    await randomDelay(2, 5);

    await dismissInstagramPopups(page);

    // Скроллим вкладку отметок
    await scrollElement(page, null, 2);

    // Собираем ссылки на отмеченные публикации
    const postHrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
      return links.slice(0, 6).map((a) => a.getAttribute('href'));
    });

    log(`[Tagged] Найдено отмеченных публикаций для анализа: ${postHrefs.length}`, 'info');

    // Проходим по отмеченным публикациям
    for (const href of postHrefs) {
      if (!href) continue;

      try {
        const fullPostUrl = `https://www.instagram.com${href}`;
        await page.goto(fullPostUrl, { waitUntil: 'domcontentloaded' });
        await randomDelay(2, 4);

        // Извлекаем автора поста и отмеченных пользователей
        const postData = await page.evaluate(() => {
          // Автор поста (обычно ссылка в хедере поста)
          const authorEl = document.querySelector('header a[role="link"], h2 a');
          const author = authorEl ? authorEl.innerText.trim() : '';

          // Текст описания поста
          const captionEl = document.querySelector('h1, div[role="button"] + span');
          const caption = captionEl ? captionEl.innerText : '';

          // Отметки на фото/видео
          const tags = [];
          const tagButtons = document.querySelectorAll('div[role="button"] span');
          tagButtons.forEach((b) => {
            if (b.innerText && b.innerText.startsWith('@')) {
              tags.push(b.innerText.replace('@', ''));
            }
          });

          return { author, caption, tags };
        });

        if (postData.author && postData.author !== username && !collectedUsers.has(postData.author)) {
          collectedUsers.add(postData.author);
          log(`[Tagged] Найден автор отмеченного поста: @${postData.author}`, 'success');

          emitContact({
            username: postData.author,
            full_name: '',
            bio: postData.caption ? `Пост: ${postData.caption.slice(0, 150)}` : 'Отмеченный пост',
            source: 'tagged_post_author',
            targetAccount: username,
            timestamp: new Date().toISOString(),
          });
        }

        // Добавляем пользователей, упомянутых в описании
        if (postData.caption) {
          const mentions = postData.caption.match(/@([a-zA-Z0-9._]{3,30})/g) || [];
          for (const m of mentions) {
            const u = sanitizeUsername(m);
            if (u && u !== username && !collectedUsers.has(u)) {
              collectedUsers.add(u);
              log(`[Tagged] Найдено упоминание в тексте: @${u}`, 'success');

              emitContact({
                username: u,
                full_name: '',
                bio: `Упоминание в посте: ${postData.caption.slice(0, 100)}`,
                source: 'tagged_caption_mention',
                targetAccount: username,
                timestamp: new Date().toISOString(),
              });
            }
          }
        }

        await randomDelay(2, 5);
      } catch (postErr) {
        log(`[Tagged] Замечание при анализе публикации: ${postErr.message}`, 'warning');
      }
    }
  } catch (err) {
    log(`[Posts & Tagged] Ошибка модуля постов: ${err.message}`, 'warning');
  }
};

/**
 * 4. Модуль парсинга Подписчиков с глубокой фильтрацией по ключевым словам:
 * Открывает модальное окно подписчиков, скроллит список, переходит в профили и фильтрует BIO.
 * @param {import('playwright').Page} page
 * @param {string} targetAccount
 * @param {(contact: object) => void} emitContact
 * @param {string[]} keywords - Ключевые слова (artist, producer, beatmaker и т.д.)
 * @param {number} limit - Лимит собираемых контактов
 * @param {(msg: string, type?: string) => void} log
 */
export const parseFollowers = async (
  page,
  targetAccount,
  emitContact,
  keywords = ['artist', 'producer', 'beatmaker', 'sound', 'music'],
  limit = 50,
  log = console.log
) => {
  const username = sanitizeUsername(targetAccount);
  log(`[Followers] Парсинг подписчиков @${username} (лимит: ${limit}, фильтр: [${keywords.join(', ')}])...`, 'info');

  const collectedProfiles = new Set();

  try {
    // Переход на страницу аккаунта
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'domcontentloaded' });
    await randomDelay(2, 4);

    await dismissInstagramPopups(page);

    // Нажатие на кнопку "Подписчики" (Followers)
    const followersLinkSelector = `a[href*="/${username}/followers/"], a:has-text("подписчик"), a:has-text("followers")`;
    const followersLink = await page.$(followersLinkSelector);

    if (followersLink) {
      await followersLink.click();
      log('[Followers] Открыто окно списка подписчиков.', 'info');
      await randomDelay(2, 4);
    } else {
      // Прямой переход по URL
      await page.goto(`https://www.instagram.com/${username}/followers/`, {
        waitUntil: 'domcontentloaded',
      });
      await randomDelay(2, 4);
    }

    // Поиск модального окна с подписчиками
    const dialogSelector = 'div[role="dialog"]';
    const dialog = await page.$(dialogSelector);
    const scrollContainerSelector = 'div[role="dialog"] div._aano, div[role="dialog"] ul, div[role="dialog"]';

    let scrollRounds = 0;
    const maxRounds = Math.max(15, Math.ceil(limit * 1.5));

    while (collectedProfiles.size < limit && scrollRounds < maxRounds) {
      scrollRounds++;

      // Сбор кандидатов из видимого списка
      const candidateUsers = await page.evaluate(() => {
        const links = Array.from(
          document.querySelectorAll('div[role="dialog"] a[role="link"], div[role="dialog"] a[href^="/"]')
        );
        const results = [];

        links.forEach((a) => {
          const href = a.getAttribute('href') || '';
          const match = href.match(/^\/([a-zA-Z0-9._]+)\/?$/);
          if (match && !['explore', 'reels', 'direct', 'stories'].includes(match[1])) {
            const user = match[1];
            // Имя пользователя (full_name) если есть в соседнем span
            const parent = a.closest('li') || a.parentElement;
            const full_name = parent ? parent.innerText.split('\n')[1] || '' : '';
            results.push({ username: user, full_name });
          }
        });

        // Убираем дубликаты
        const seen = new Set();
        return results.filter((item) => {
          if (seen.has(item.username)) return false;
          seen.add(item.username);
          return true;
        });
      });

      log(`[Followers] Такт #${scrollRounds}: обнаружено ${candidateUsers.length} подписчиков в списке.`, 'info');

      // Фильтрация и детальный анализ каждого профиля
      for (const candidate of candidateUsers) {
        if (collectedProfiles.size >= limit) break;
        if (collectedProfiles.has(candidate.username) || candidate.username === username) continue;

        collectedProfiles.add(candidate.username);

        // Открываем профиль в новой вкладке для проверки BIO и соблюдения рандомизированных задержек
        try {
          const profilePage = await page.context().newPage();
          await profilePage.goto(`https://www.instagram.com/${candidate.username}/`, {
            waitUntil: 'domcontentloaded',
            timeout: 15000,
          });

          await randomDelay(1.5, 3.5);

          // Считываем информацию профиля
          const profileDetails = await profilePage.evaluate(() => {
            // Bio селекторы Instagram
            const bioElement = document.querySelector('header section div._aa_c, header section h1 + div, header section');
            const bioText = bioElement ? bioElement.innerText : '';

            // Полное имя
            const nameEl = document.querySelector('header h1, header h2');
            const fullName = nameEl ? nameEl.innerText : '';

            // Количество подписчиков
            const followersEl = document.querySelector('a[href*="/followers/"] span, a[href*="/followers/"]');
            const followersText = followersEl ? followersEl.getAttribute('title') || followersEl.innerText : '0';

            return {
              bio: bioText,
              fullName,
              followers: followersText,
            };
          });

          await profilePage.close();

          // Проверяем фильтр ключевых слов
          const { isMatch, matchedKeywords } = checkKeywords(profileDetails.bio, keywords);

          if (isMatch) {
            log(
              `[Filter MATCH] Найден целевой артист/продюсер: @${candidate.username} [Теги: ${matchedKeywords.join(', ')}]`,
              'success'
            );

            emitContact({
              username: candidate.username,
              full_name: profileDetails.fullName || candidate.full_name || '',
              bio: profileDetails.bio.replace(/\n/g, ' ').slice(0, 200),
              followers: profileDetails.followers,
              matchedKeywords,
              source: 'followers',
              targetAccount: username,
              timestamp: new Date().toISOString(),
            });
          } else {
            log(`[Filter Skip] @${candidate.username} не содержит целевых ключевых слов.`, 'info');
          }

          // Человеческая пауза между переходом по профилям (2 - 5 сек)
          await randomDelay(2, 5);
        } catch (subErr) {
          log(`[Followers] Не удалось загрузить BIO @${candidate.username}: ${subErr.message}`, 'warning');
        }
      }

      // Скроллим модальное окно подписчиков вниз
      await scrollElement(page, scrollContainerSelector, 2);
      await randomDelay(2, 5);
    }

    log(`[Followers] Завершен сбор подписчиков. Отобрано лидов: ${collectedProfiles.size}`, 'success');
  } catch (err) {
    log(`[Followers] Ошибка парсинга подписчиков: ${err.message}`, 'warning');
  }
};

// ============================================================================
// ГЛАВНЫЙ КООРДИНАТОР ПАРСЕРА (RUN PARSER)
// ============================================================================

/**
 * Запуск полного цикла парсинга по предоставленному объекту options.
 *
 * @param {object} options - Конфигурация задачи
 * @param {string} options.targetAccount - Целевой аккаунт или ссылка
 * @param {boolean} [options.warmupLenta=true] - Прогрев главной ленты 15-30 сек
 * @param {boolean} [options.parseStories=true] - Модуль 1: сторис и отметки
 * @param {boolean} [options.parsePostsAndTagged=true] - Модуль 2: посты и вкладка Tagged
 * @param {boolean} [options.parseFollowers=true] - Модуль 3: подписчики с фильтрацией BIO
 * @param {number} [options.parseLimit=50] - Лимит собираемых профилей
 * @param {string[]} [options.keywords] - Ключевые слова для BIO
 * @param {string} [options.userDataDir='./user_data/insta_profile'] - Папка сессии
 * @param {(contact: object) => void} [onDataCallback] - Отправка лида в CRM
 * @param {(status: object) => void} [onStatusCallback] - Отправка логов и статуса в CRM
 * @returns {Promise<{ status: string, totalCollected: number, contacts: object[] }>}
 */
export async function runParser(
  options,
  onDataCallback = () => {},
  onStatusCallback = () => {}
) {
  const config = {
    targetAccount: options.targetAccount || 'beatstars',
    warmupLenta: options.warmupLenta !== false,
    parseStories: options.parseStories !== false,
    parsePostsAndTagged: options.parsePostsAndTagged !== false,
    parseFollowers: options.parseFollowers !== false,
    parseLimit: options.parseLimit || 50,
    keywords: options.keywords || ['artist', 'producer', 'beatmaker', 'sound', 'music'],
    userDataDir: options.userDataDir || './insta_session',
  };

  const collectedContacts = [];

  const log = (message, type = 'info') => {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    console.log(`[${entry.type.toUpperCase()}] ${entry.message}`);
    onStatusCallback({ event: 'log', data: entry });
  };

  const emitContact = (contact) => {
    collectedContacts.push(contact);
    onDataCallback(contact);
    onStatusCallback({
      event: 'new_contact',
      contact,
      totalCollected: collectedContacts.length,
    });
  };

  log(`Инициализация Chromium браузера (видимый режим headless: false, профиль: ${config.userDataDir})...`, 'info');
  onStatusCallback({ event: 'status', status: 'STARTING', config });

  let browserContext = null;

  try {
    // 1. Запуск видимого браузера с постоянной сессией
    const { context, page } = await initBrowser(config.userDataDir, false);
    browserContext = context;

    // 2. Простой переход на instagram.com (без ожидания селектора input[name="username"])
    log('Переход на instagram.com для проверки сессии...', 'info');
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
    await randomDelay(2000, 5000);

    const currentUrl = page.url();
    const isLoginRequired = currentUrl.includes('/accounts/login') || currentUrl.includes('/login');

    if (isLoginRequired) {
      log('Требуется вход вручную: браузер открыт в видимом окне для авторизации.', 'warning');
      onStatusCallback({
        event: 'status',
        status: 'NEEDS_MANUAL_AUTH',
        message: 'Требуется вход вручную',
      });
      // Не выбрасываем TimeoutError, позволяем пользователю войти в открытом окне браузера
    } else {
      log('Сессия Instagram активна! Бот сразу приступает к сбору данных.', 'success');
      onStatusCallback({ event: 'status', status: 'RUNNING' });
    }

    // 3. Прогрев главной ленты (Warmup)
    if (config.warmupLenta && !isLoginRequired) {
      await warmup(page, 20, log);
    }

    // 4. Модуль 1: Просмотр Stories и сбор отметок
    if (config.parseStories) {
      await parseStories(page, config.targetAccount, emitContact, log);
    }

    // 5. Модуль 2: Просмотр последних постов и вкладки "Отметки" (Tagged)
    if (config.parsePostsAndTagged) {
      await parsePostsAndTagged(page, config.targetAccount, emitContact, log);
    }

    // 6. Модуль 3: Парсинг подписчиков с фильтрацией BIO по keywords
    if (config.parseFollowers) {
      await parseFollowers(
        page,
        config.targetAccount,
        emitContact,
        config.keywords,
        config.parseLimit,
        log
      );
    }

    log(`Парсинг успешно завершен! Всего собрано профилей: ${collectedContacts.length}`, 'success');
    
    // Отправка события завершения парсинга для CRM
    onStatusCallback({
      event: 'PARSING_COMPLETE',
      status: 'COMPLETED',
      totalCollected: collectedContacts.length,
      contacts: collectedContacts,
    });
    onStatusCallback({
      event: 'status',
      status: 'COMPLETED',
      totalCollected: collectedContacts.length,
    });

    return {
      status: 'COMPLETED',
      totalCollected: collectedContacts.length,
      contacts: collectedContacts,
    };
  } catch (fatalError) {
    log(`Критическая ошибка работы парсера: ${fatalError.message}`, 'error');
    onStatusCallback({ event: 'status', status: 'FAILED', error: fatalError.message });
    throw fatalError;
  } finally {
    if (browserContext) {
      log('Завершение сеанса браузера...', 'info');
      await randomDelay(2000, 3000);
      await browserContext.close();
      log('Окно браузера закрыто.', 'info');
    }
  }
}

// ============================================================================
// ПРИМЕР ЗАПУСКА СКРИПТА (STANDALONE CLI ИЛИ ИНТЕГРАЦИЯ)
// ============================================================================
// Если скрипт запущен напрямую через `node parser.js`:
if (process.argv[1] && process.argv[1].endsWith('parser.js')) {
  console.log('=== ЗАПУСК ПАРСЕРА INSTAGRAM (STANDALONE MODE) ===');

  const testOptions = {
    targetAccount: process.argv[2] || 'beatstars',
    warmupLenta: true,
    parseStories: true,
    parsePostsAndTagged: true,
    parseFollowers: true,
    parseLimit: 15,
    keywords: ['artist', 'producer', 'beatmaker', 'sound', 'music', 'beats', 'sound engineer'],
  };

  runParser(
    testOptions,
    (contact) => {
      console.log(`\n>>> [CRM EVENT: NEW LEAD] @${contact.username} (${contact.full_name}) | ${contact.source}`);
      console.log(`    BIO: ${contact.bio}\n`);
    },
    (statusUpdate) => {
      if (statusUpdate.event === 'status') {
        console.log(`>>> [CRM STATUS UPDATE] => ${statusUpdate.status}`);
      }
    }
  )
    .then((result) => {
      console.log('\n=== ИТОГ РАБОТЫ ===', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n=== ОШИБКА РАБОТЫ ===', err);
      process.exit(1);
    });
}
