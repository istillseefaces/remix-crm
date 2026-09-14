import * as XLSX from 'xlsx';
import { Artist, Deal, ConnectStatus, SalesStatus, ArtistStatus, DemoStatus, ReactionStatus, DealPlatform, DealStage } from '../types';

export interface AppSnapshot {
  version: string;
  exportedAt: string;
  artists: Artist[];
  deals: Deal[];
}

export function exportToJsonFile(artists: Artist[], deals: Deal[]) {
  const snapshot: AppSnapshot = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    artists,
    deals,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `verse_crm_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportArtistsToExcel(artists: Artist[], lang: 'ru' | 'en' = 'ru') {
  const isRu = lang === 'ru';
  const data = artists.map((a) => ({
    [isRu ? 'Инста / Имя' : 'Insta / Name']: a.name,
    [isRu ? 'Ссылка Instagram' : 'Instagram URL']: a.instagram,
    [isRu ? 'Почта' : 'Email']: a.email,
    [isRu ? 'Номер / iMessage' : 'Phone / iMessage']: a.phone,
    [isRu ? 'Telegram' : 'Telegram']: a.telegram,
    [isRu ? 'Discord' : 'Discord']: a.discord,
    [isRu ? 'Коннект' : 'Connect']: a.connect === 'yes' ? (isRu ? 'Есть коннект' : 'Yes') : (isRu ? 'Без коннекта' : 'No'),
    [isRu ? 'Тайпы' : 'Types']: a.types.join(', '),
    [isRu ? 'Продажи' : 'Sales']: a.sales === 'yes' ? (isRu ? 'Да' : 'Yes') : (isRu ? 'Нет' : 'No'),
    [isRu ? 'Статус' : 'Status']: a.status,
    [isRu ? 'Демо / Отправка' : 'Demo / Sent']: a.demoStatus,
    [isRu ? 'Касания' : 'Touches']: a.touches,
    [isRu ? 'Реакция' : 'Reaction']: a.reaction,
    [isRu ? 'Напоминание (Follow-up)' : 'Follow-up Date']: a.followUpDate,
    [isRu ? 'Заметки' : 'Notes']: a.notes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, isRu ? 'Артисты' : 'Artists');
  XLSX.writeFile(workbook, `verse_artists_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportDealsToExcel(deals: Deal[], lang: 'ru' | 'en' = 'ru') {
  const isRu = lang === 'ru';
  const data = deals.map((d) => ({
    [isRu ? 'Артист' : 'Artist']: d.artistName,
    [isRu ? 'Соц. сеть' : 'Platform']: d.platform,
    [isRu ? 'Этап' : 'Stage']: d.stage,
    [isRu ? 'Сумма' : 'Amount']: d.amount,
    [isRu ? 'Валюта' : 'Currency']: d.currency,
    [isRu ? 'Дата сделки' : 'Deal Date']: d.date,
    [isRu ? 'Примечания / Условия' : 'Notes / Terms']: d.notes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, isRu ? 'Сделки' : 'Deals');
  XLSX.writeFile(workbook, `verse_deals_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportFullWorkbook(artists: Artist[], deals: Deal[], lang: 'ru' | 'en' = 'ru') {
  const isRu = lang === 'ru';
  const artistsData = artists.map((a) => ({
    [isRu ? 'Инста / Имя' : 'Insta / Name']: a.name,
    [isRu ? 'Ссылка Instagram' : 'Instagram URL']: a.instagram,
    [isRu ? 'Почта' : 'Email']: a.email,
    [isRu ? 'Номер / iMessage' : 'Phone / iMessage']: a.phone,
    [isRu ? 'Telegram' : 'Telegram']: a.telegram,
    [isRu ? 'Discord' : 'Discord']: a.discord,
    [isRu ? 'Коннект' : 'Connect']: a.connect === 'yes' ? (isRu ? 'Есть коннект' : 'Yes') : (isRu ? 'Без коннекта' : 'No'),
    [isRu ? 'Тайпы' : 'Types']: a.types.join(', '),
    [isRu ? 'Продажи' : 'Sales']: a.sales === 'yes' ? (isRu ? 'Да' : 'Yes') : (isRu ? 'Нет' : 'No'),
    [isRu ? 'Статус' : 'Status']: a.status,
    [isRu ? 'Демо / Отправка' : 'Demo / Sent']: a.demoStatus,
    [isRu ? 'Касания' : 'Touches']: a.touches,
    [isRu ? 'Реакция' : 'Reaction']: a.reaction,
    [isRu ? 'Напоминание' : 'Follow-up Date']: a.followUpDate,
    [isRu ? 'Заметки' : 'Notes']: a.notes,
  }));

  const dealsData = deals.map((d) => ({
    [isRu ? 'Артист' : 'Artist']: d.artistName,
    [isRu ? 'Соц. сеть' : 'Platform']: d.platform,
    [isRu ? 'Этап' : 'Stage']: d.stage,
    [isRu ? 'Сумма' : 'Amount']: d.amount,
    [isRu ? 'Валюта' : 'Currency']: d.currency,
    [isRu ? 'Дата сделки' : 'Deal Date']: d.date,
    [isRu ? 'Примечания / Условия' : 'Notes / Terms']: d.notes,
  }));

  const workbook = XLSX.utils.book_new();
  const artistsSheet = XLSX.utils.json_to_sheet(artistsData);
  const dealsSheet = XLSX.utils.json_to_sheet(dealsData);

  XLSX.utils.book_append_sheet(workbook, artistsSheet, isRu ? 'Артисты' : 'Artists');
  XLSX.utils.book_append_sheet(workbook, dealsSheet, isRu ? 'Сделки' : 'Deals');
  XLSX.writeFile(workbook, `verse_crm_full_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Helper to normalize and parse spreadsheet dates from Excel serial numbers,
 * Russian format (DD.MM.YYYY), or standard ISO strings (YYYY-MM-DD).
 */
export function parseSpreadsheetDate(raw: any): string {
  if (!raw && raw !== 0) return '';
  if (raw instanceof Date) {
    return raw.toISOString().split('T')[0];
  }
  // If Excel serial date number (e.g. 44560 = 2022-01-01)
  if (typeof raw === 'number' && raw > 20000 && raw < 80000) {
    const jsDate = new Date((raw - 25569) * 86400 * 1000);
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString().split('T')[0];
    }
  }

  const str = String(raw).trim();
  if (!str) return '';

  // Check DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const ruMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (ruMatch) {
    const day = ruMatch[1].padStart(2, '0');
    const month = ruMatch[2].padStart(2, '0');
    const year = ruMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Check YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const isoMatch = str.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return '';
}

/**
 * Robust cell getter that searches row keys for specified candidate field terms.
 */
function getRowValue(row: Record<string, any>, ...candidateTerms: string[]): any {
  if (!row) return '';
  const rowKeys = Object.keys(row);

  // 1. Exact match (case insensitive)
  for (const term of candidateTerms) {
    const cleanTerm = term.toLowerCase().trim();
    for (const key of rowKeys) {
      if (key.toLowerCase().trim() === cleanTerm) {
        return row[key];
      }
    }
  }

  // 2. Contains match
  for (const term of candidateTerms) {
    const cleanTerm = term.toLowerCase().trim();
    for (const key of rowKeys) {
      const cleanKey = key.toLowerCase().trim();
      if (cleanKey.includes(cleanTerm)) {
        return row[key];
      }
    }
  }

  return '';
}

/**
 * Parse an array of raw rows into Artist objects with strict column mappings:
 * - ПРОДАЖИ
 * - СТАТУС
 * - ДЕМО / ОТПРАВКА
 * - КАСАНИЯ
 * - РЕАКЦИЯ
 * - НАПОМИНАНИЕ
 * - ТАЙПЫ: if cell is empty, leave types as [] (no default tags)
 * Preserves exact original row order.
 */
export function parseArtistsFromRows(rows: Record<string, any>[]): Artist[] {
  const baseTimestamp = Date.now();

  return rows.map((r, idx) => {
    // 1. Name / Instagram handle
    const rawName = getRowValue(r, 'инста / имя', 'инста/имя', 'имя', 'инста', 'name', 'artist', 'insta', 'артист', 'ник', 'псевдоним');
    const name = String(rawName || `Artist #${idx + 1}`).trim();

    // 2. Links & Contacts
    const instagram = String(getRowValue(r, 'ссылка instagram', 'инстаграм', 'instagram', 'insta', 'ig') || '').trim();
    const email = String(getRowValue(r, 'почта', 'email', 'mail', 'e-mail', 'мейл') || '').trim();
    const phone = String(getRowValue(r, 'номер / imessage', 'номер/imessage', 'номер', 'телефон', 'phone', 'imessage', 'тел') || '').trim();
    const telegram = String(getRowValue(r, 'telegram', 'тг', 'телеграм', 'tg') || '').trim();
    const discord = String(getRowValue(r, 'discord', 'дискорд', 'ds') || '').trim();
    const notes = String(getRowValue(r, 'заметки', 'заметка', 'notes', 'note', 'коммент', 'комментарий', 'инфо', 'описание') || '').trim();

    // 3. Connect (Коннект)
    const connectRaw = String(getRowValue(r, 'коннект', 'connect', 'связь', 'контакт') || '').toLowerCase().trim();
    const connect: ConnectStatus =
      connectRaw.includes('есть') || connectRaw.includes('yes') || connectRaw.includes('true') || connectRaw === '1' || connectRaw === '+' || connectRaw.includes('да')
        ? 'yes'
        : 'no';

    // 4. ПРОДАЖИ (Sales)
    const salesRaw = String(getRowValue(r, 'продажи', 'продаж', 'sales', 'продажа', 'куплено', 'sale', 'has_sales', 'покупки') || '').toLowerCase().trim();
    const sales: SalesStatus =
      salesRaw.includes('да') || salesRaw.includes('yes') || salesRaw.includes('true') || salesRaw === '1' || salesRaw === '+' || salesRaw.includes('есть') || salesRaw.includes('купил') || salesRaw.includes('paid')
        ? 'yes'
        : 'no';

    // 5. СТАТУС (Status)
    const statusRaw = String(getRowValue(r, 'статус', 'status', 'состояние', 'артист статус') || '').toLowerCase().trim();
    let status: ArtistStatus = 'active';
    if (statusRaw.includes('пассив') || statusRaw.includes('passive') || statusRaw.includes('dormant') || statusRaw.includes('холод')) {
      status = 'passive';
    } else if (statusRaw.includes('мертв') || statusRaw.includes('dead') || statusRaw.includes('неактив') || statusRaw.includes('lost') || statusRaw.includes('архив') || statusRaw.includes('archive')) {
      status = 'dead';
    } else if (statusRaw.includes('актив') || statusRaw.includes('active')) {
      status = 'active';
    }

    // 6. ДЕМО / ОТПРАВКА (Demo status)
    const demoRaw = String(getRowValue(r, 'демо / отправка', 'демо/отправка', 'демо', 'отправка', 'demo', 'sent', 'demo status', 'отправлено', 'пак', 'демо-записи') || '').toLowerCase().trim();
    let demoStatus: DemoStatus = 'none';
    if (demoRaw.includes('понрав') || demoRaw.includes('liked') || demoRaw.includes('зашло') || demoRaw.includes('лайк') || demoRaw.includes('огонь') || demoRaw.includes('топ') || demoRaw.includes('одобрено')) {
      demoStatus = 'liked';
    } else if (demoRaw.includes('работ') || demoRaw.includes('progress') || demoRaw.includes('в работе') || demoRaw.includes('в процессе') || demoRaw.includes('пишет')) {
      demoStatus = 'in_progress';
    } else if (demoRaw.includes('отклон') || demoRaw.includes('отказ') || demoRaw.includes('reject') || demoRaw.includes('не зашло') || demoRaw.includes('мимо')) {
      demoStatus = 'rejected';
    } else if (demoRaw.includes('отправ') || demoRaw.includes('sent') || demoRaw.includes('скинул') || demoRaw.includes('выслано') || demoRaw.includes('чекнул')) {
      demoStatus = 'sent';
    } else {
      demoStatus = 'none';
    }

    // 7. КАСАНИЯ (Touches)
    const touchesRaw = getRowValue(r, 'касания', 'касаний', 'касан', 'touches', 'touch', 'кол-во касаний', 'тачи', 'контакты');
    const touches = typeof touchesRaw === 'number' ? Math.max(0, Math.floor(touchesRaw)) : parseInt(String(touchesRaw || '0').replace(/[^0-9]/g, ''), 10) || 0;

    // 8. РЕАКЦИЯ (Reaction)
    const reactionRaw = String(getRowValue(r, 'реакция', 'реакц', 'reaction', 'ответ', 'react') || '').toLowerCase().trim();
    let reaction: ReactionStatus = 'none';
    if (reactionRaw.includes('игнор') || reactionRaw.includes('ignore') || reactionRaw.includes('молчит') || reactionRaw.includes('seen') || reactionRaw.includes('прочитал')) {
      reaction = 'ignored';
    } else if (reactionRaw.includes('слуш') || reactionRaw.includes('listen') || reactionRaw.includes('послушает') || reactionRaw.includes('чекает') || reactionRaw.includes('слушает')) {
      reaction = 'listening';
    } else if (reactionRaw.includes('ответ') || reactionRaw.includes('repl') || reactionRaw.includes('ответил') || reactionRaw.includes('на связи')) {
      reaction = 'replied';
    } else if (reactionRaw.includes('еще') || reactionRaw.includes('ещё') || reactionRaw.includes('more') || reactionRaw.includes('wants_more') || reactionRaw.includes('хочет еще') || reactionRaw.includes('скинь еще')) {
      reaction = 'wants_more';
    } else if (reactionRaw.includes('куп') || reactionRaw.includes('buy') || reactionRaw.includes('ready_to_buy') || reactionRaw.includes('ready to buy') || reactionRaw.includes('покупает') || reactionRaw.includes('готов купить')) {
      reaction = 'ready_to_buy';
    } else {
      reaction = 'none';
    }

    // 9. НАПОМИНАНИЕ (Follow-up date)
    const followUpRaw = getRowValue(r, 'напоминание (follow-up)', 'напоминание', 'напомин', 'follow-up', 'followup', 'follow up', 'след. контакт', 'следующий контакт', 'дата контакта', 'follow up date', 'дедлайн');
    const followUpDate = parseSpreadsheetDate(followUpRaw);

    // 10. ТАЙПЫ / ЖАНРЫ (Types): strictly empty array [] if cell is empty (NO default value!)
    const typesRaw = getRowValue(r, 'тайпы', 'тайп', 'жанры', 'жанр', 'types', 'type', 'tags', 'теги', 'звук', 'стиль');
    let types: string[] = [];
    if (typesRaw !== null && typesRaw !== undefined) {
      const typesStr = String(typesRaw).trim();
      if (typesStr.length > 0) {
        types = typesStr
          .split(/[,;/|\n]+/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    const todayIso = new Date().toISOString().split('T')[0];

    return {
      id: `art-imp-${baseTimestamp}-${idx}`,
      name,
      instagram,
      email,
      phone,
      telegram,
      discord,
      notes,
      connect,
      types, // Strictly empty [] if not in spreadsheet
      sales,
      status,
      demoStatus,
      touches,
      reaction,
      followUpDate,
      createdAt: todayIso,
      updatedAt: todayIso,
    };
  });
}

/**
 * Parse an array of raw rows into Deal objects with full field mapping:
 * - Артист (Artist)
 * - Соц. сеть (Platform/Social)
 * - Этап (Stage/Status)
 * - Сумма (Amount)
 * - Дата сделки (Date)
 * - Примечания (Notes)
 */
export function parseDealsFromRows(rows: Record<string, any>[]): Deal[] {
  const baseTimestamp = Date.now();
  const todayIso = new Date().toISOString().split('T')[0];

  return rows.map((r, idx) => {
    // 1. Artist Name
    const artistNameRaw = getRowValue(r, 'артист', 'artist', 'имя', 'name', 'клиент', 'client', 'покупатель', 'битмейкер');
    const artistName = String(artistNameRaw || `Deal #${idx + 1}`).trim();

    // 2. Platform / Social
    const platformRaw = String(getRowValue(r, 'соц. сеть', 'соцсеть', 'соц сеть', 'соц', 'platform', 'social', 'канал', 'channel', 'источник') || '').toLowerCase().trim();
    let platform: DealPlatform = 'Instagram';
    if (platformRaw.includes('telegr') || platformRaw.includes('тг') || platformRaw.includes('телеграм')) {
      platform = 'Telegram';
    } else if (platformRaw.includes('imess') || platformRaw.includes('аймесс') || platformRaw.includes('телефон') || platformRaw.includes('phone')) {
      platform = 'iMessage';
    } else if (platformRaw.includes('disc') || platformRaw.includes('дискорд')) {
      platform = 'Discord';
    } else if (platformRaw.includes('mail') || platformRaw.includes('почт') || platformRaw.includes('email')) {
      platform = 'Email';
    } else if (platformRaw.includes('other') || platformRaw.includes('друг') || platformRaw.includes('сайт')) {
      platform = 'Other';
    } else if (platformRaw.includes('insta') || platformRaw.includes('инста')) {
      platform = 'Instagram';
    }

    // 3. Stage (Этап)
    const stageRaw = String(getRowValue(r, 'этап', 'stage', 'статус', 'status', 'этап сделки', 'состояние') || '').toLowerCase().trim();
    let stage: DealStage = 'interested';
    if (stageRaw.includes('закрыт') || stageRaw.includes('closed') || stageRaw.includes('won') || stageRaw.includes('оплачен') || stageRaw.includes('paid') || stageRaw.includes('успех')) {
      stage = 'closed';
    } else if (stageRaw.includes('процесс') || stageRaw.includes('progress') || stageRaw.includes('в работе') || stageRaw.includes('in_progress') || stageRaw.includes('переговор')) {
      stage = 'in_progress';
    } else if (stageRaw.includes('отмен') || stageRaw.includes('lost') || stageRaw.includes('cancel') || stageRaw.includes('отказ') || stageRaw.includes('сорвал')) {
      stage = 'cancelled';
    } else {
      stage = 'interested';
    }

    // 4. Amount (Сумма)
    const amountRaw = getRowValue(r, 'сумма', 'amount', 'цена', 'price', 'стоимость', 'выручка', 'revenue', 'чек');
    const amount = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw || '0').replace(/[^0-9.]/g, '')) || 0;

    // 5. Currency
    const currency = String(getRowValue(r, 'валюта', 'currency') || '$').trim() || '$';

    // 6. Date (Дата сделки)
    const dateRaw = getRowValue(r, 'дата сделки', 'дата', 'date', 'deal date', 'число', 'создано');
    const date = parseSpreadsheetDate(dateRaw) || todayIso;

    // 7. Notes (Примечания / Условия)
    const notes = String(getRowValue(r, 'примечания / условия', 'примечания', 'примечание', 'notes', 'note', 'коммент', 'комментарий', 'условия', 'роялти', 'права', 'terms') || '').trim();

    return {
      id: `deal-imp-${baseTimestamp}-${idx}`,
      artistName,
      platform,
      stage,
      amount,
      currency,
      date,
      notes,
      createdAt: todayIso,
      updatedAt: todayIso,
    };
  });
}

/**
 * Universal Multi-Page Google Sheet & File Parser:
 * - JSON: Snapshot restoring both artists and deals.
 * - XLSX Multi-sheet:
 *   - Auto-detects Sheet 1 (Artists) and Sheet 2 (Deals).
 *   - Returns both datasets with exact row order preserved.
 * - Single-sheet XLSX/CSV:
 *   - Determines if the sheet contains Deals or Artists based on columns.
 */
export async function parseImportFile(file: File): Promise<{
  artists?: Artist[];
  deals?: Deal[];
  type: 'artists' | 'deals' | 'snapshot' | 'unknown';
  count: number;
  sheetInfo?: {
    artistsCount?: number;
    dealsCount?: number;
    sheet1Name?: string;
    sheet2Name?: string;
  };
}> {
  // 1. JSON Snapshot Import
  if (file.name.endsWith('.json')) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (parsed.artists || parsed.deals) {
      return {
        artists: parsed.artists || [],
        deals: parsed.deals || [],
        type: 'snapshot',
        count: (parsed.artists?.length || 0) + (parsed.deals?.length || 0),
        sheetInfo: {
          artistsCount: parsed.artists?.length || 0,
          dealsCount: parsed.deals?.length || 0,
        },
      };
    }
  }

  // 2. Spreadsheet Buffer Reading via SheetJS
  const dataBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(dataBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    return { type: 'unknown', count: 0 };
  }

  // Multi-page spreadsheet detection (Sheet 1 = Artists, Sheet 2 = Deals)
  if (sheetNames.length >= 2) {
    let artistSheetName = sheetNames[0];
    let dealSheetName = sheetNames[1];

    // Check if sheet names explicitly specify which is which
    for (const name of sheetNames) {
      const lower = name.toLowerCase();
      if (lower.includes('сделк') || lower.includes('deal') || lower.includes('продаж')) {
        dealSheetName = name;
      } else if (lower.includes('артист') || lower.includes('artist') || lower.includes('база') || lower.includes('контакт')) {
        artistSheetName = name;
      }
    }

    const artistWorksheet = workbook.Sheets[artistSheetName];
    const dealWorksheet = workbook.Sheets[dealSheetName];

    const artistRows: Record<string, any>[] = artistWorksheet ? XLSX.utils.sheet_to_json(artistWorksheet) : [];
    const dealRows: Record<string, any>[] = dealWorksheet ? XLSX.utils.sheet_to_json(dealWorksheet) : [];

    const parsedArtists = parseArtistsFromRows(artistRows);
    const parsedDeals = parseDealsFromRows(dealRows);

    return {
      artists: parsedArtists,
      deals: parsedDeals,
      type: 'snapshot',
      count: parsedArtists.length + parsedDeals.length,
      sheetInfo: {
        artistsCount: parsedArtists.length,
        dealsCount: parsedDeals.length,
        sheet1Name: artistSheetName,
        sheet2Name: dealSheetName,
      },
    };
  }

  // Single-sheet spreadsheet handling
  const singleSheetName = sheetNames[0];
  const worksheet = workbook.Sheets[singleSheetName];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

  if (!rows || rows.length === 0) {
    return { type: 'unknown', count: 0 };
  }

  // Detect whether the single sheet is Deals or Artists
  const firstRow = rows[0];
  const keys = Object.keys(firstRow).map((k) => k.toLowerCase().trim());
  const isDeals =
    keys.some((k) => k.includes('сумма') || k.includes('amount') || k.includes('чек') || k.includes('цена')) &&
    keys.some((k) => k.includes('этап') || k.includes('stage') || k.includes('соц') || k.includes('platform'));

  if (isDeals) {
    const deals = parseDealsFromRows(rows);
    return {
      deals,
      type: 'deals',
      count: deals.length,
      sheetInfo: {
        dealsCount: deals.length,
        sheet1Name: singleSheetName,
      },
    };
  } else {
    const artists = parseArtistsFromRows(rows);
    return {
      artists,
      type: 'artists',
      count: artists.length,
      sheetInfo: {
        artistsCount: artists.length,
        sheet1Name: singleSheetName,
      },
    };
  }
}

/**
 * Extracts and copies a clean, newline-separated list of email addresses to the clipboard.
 * Strictly adheres to specifications:
 * - Separator: '\n' (newline)
 * - No commas, semicolons, brackets, quotes, or outer whitespace
 * - Skips empty/whitespace-only email fields
 */
export async function copyCleanEmailList(artists: Artist[]): Promise<{ count: number; text: string; success: boolean }> {
  // Filter out empty and whitespace-only emails, trim each
  const cleanEmails = artists
    .map((a) => (a.email ? String(a.email).trim() : ''))
    .filter((email) => email.length > 0 && email.includes('@'));

  const text = cleanEmails.join('\n');

  if (cleanEmails.length === 0) {
    return { count: 0, text: '', success: true };
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { count: cleanEmails.length, text, success: true };
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, trying fallback textarea:', err);
  }

  // Fallback for iFrames or environments where clipboard API needs focus
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return { count: cleanEmails.length, text, success: successful };
  } catch (e) {
    console.error('Copy to clipboard failed completely:', e);
    return { count: cleanEmails.length, text, success: false };
  }
}
