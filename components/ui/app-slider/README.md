# AppSlider - Архитектура компонента

## Структура

```
app-slider/
├── types.ts                  # Типы и интерфейсы
├── use-slider-gesture.ts     # Хук для жестов перемещения
├── use-tooltip-position.ts   # Хук для расчета позиции тултипа
└── slider-thumb.tsx          # Компонент ползунка с тултипом
```

## Компоненты

### `AppSlider` (app-slider.tsx)
Главный компонент, который:
- Управляет состоянием (single/range режимы)
- Координирует работу подкомпонентов
- Обрабатывает синхронизацию с внешними props
- Рендерит трек и прогресс-бар

**Размер**: ~230 строк (было ~500)

### `SliderThumb` (slider-thumb.tsx)
Компонент отдельного ползунка:
- Отображает тултип со значением
- Управляет жестами перемещения
- Применяет умное позиционирование

**Размер**: ~130 строк

## Хуки

### `useSliderGesture`
Создает жест для перемещения ползунка с поддержкой:
- Ограничений по min/max процентам (для range mode)
- Real-time обновления значения
- Колбэков onUpdate и onChange

**Использование**:
```typescript
const gesture = useSliderGesture({
  percentage,
  isActive,
  sliderWidth,
  maxPercentage,
  minPercentage,
  onUpdate,
  onChange,
});
```

### `useTooltipPosition`
Рассчитывает позицию тултипа с учетом границ экрана:
- Предотвращает выход за левый край
- Предотвращает выход за правый край
- Применяет отступ (по умолчанию 16px)

**Использование**:
```typescript
const tooltipStyle = useTooltipPosition({
  percentage,
  tooltipWidth,
  sliderWidth,
  containerXOffset,
  screenWidth,
  edgePadding: 16,
});
```

## Преимущества рефакторинга

### 1. **Модульность**
- Каждый файл отвечает за одну задачу
- Легко найти и изменить нужную логику
- Переиспользуемые хуки

### 2. **Читаемость**
- Главный компонент стал в 2 раза меньше
- Понятная структура с документацией
- Явные зависимости между модулями

### 3. **Тестируемость**
- Хуки можно тестировать отдельно
- Компоненты изолированы
- Простая mock-зависимостей

### 4. **Поддерживаемость**
- Легко добавить новые фичи
- Простое исправление багов
- Документированный код

## Принципы

1. **Single Responsibility** - каждый модуль делает одно дело
2. **DRY** - логика не дублируется
3. **Composition** - компоненты комбинируются
4. **Encapsulation** - детали реализации скрыты

## API

См. `types.ts` для полного описания интерфейсов.

### Props компонента `AppSlider`

```typescript
interface AppSliderProps {
  min: number;
  max: number;
  step: number;
  value?: number;           // Для single mode
  valueFrom?: number;       // Для range mode
  valueTo?: number;         // Для range mode
  mode?: 'single' | 'range';
  onChange?: (value: number) => void;
  onRangeChange?: (from: number, to: number) => void;
  formatValue?: (value: number) => string;
  style?: ViewStyle;
}
```

## Производительность

- ✅ Все анимации работают на UI thread (Reanimated 2)
- ✅ Минимальные re-renders (используются shared values)
- ✅ Оптимизированные worklet-функции
- ✅ Efficient layout measurements
