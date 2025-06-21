/**
 * Таблицы базовых цен и коэффициентов
 * Используется калькулятором стоимости.
 */

export const basePrice: Record<string, number> = {
  ventilation: 4000,     // ₽
  conditioning: 6000,    // ₽
  refrigeration: 9000,   // ₽
};

export const kObject: Record<string, number> = {
  flat: 1,     // квартира
  office: 1.2, // офис
  warehouse: 1.5, // склад, производство
};

export const kUrgency: Record<string, number> = {
  normal: 1,       // обычный вызов
  fast: 1.4,       // срочный
  emergency: 2,    // аварийный
};

export const sqmRate = 50; // ₽ за каждый м² (добавляется к итогу)
