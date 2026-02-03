import { describe, it, expect } from 'vitest';
import {
  TextInputPropsSchema,
  TextareaPropsSchema,
  RichTextEditorPropsSchema,
  NumberInputPropsSchema,
  CurrencyInputPropsSchema,
  SliderPropsSchema,
  RatingInputPropsSchema,
  DatePickerPropsSchema,
  DateTimePickerPropsSchema,
  TimePickerPropsSchema,
  DateRangePickerPropsSchema,
  SelectPropsSchema,
  AutocompletePropsSchema,
  TagInputPropsSchema,
  CascaderPropsSchema,
  CheckboxPropsSchema,
  SwitchPropsSchema,
  RadioGroupPropsSchema,
  FileUploadPropsSchema,
  ImageUploadPropsSchema,
  ColorPickerPropsSchema,
  SignaturePadPropsSchema,
  CodeEditorPropsSchema,
} from './input.zod';

describe('TextInputPropsSchema', () => {
  it('should accept minimal text input config', () => {
    const props = {};
    const result = TextInputPropsSchema.parse(props);
    expect(result.size).toBe('medium');
    expect(result.clearable).toBe(false);
  });

  it('should accept full text input config', () => {
    const props = {
      placeholder: 'Enter text',
      maxLength: 100,
      minLength: 5,
      pattern: '^[a-z]+$',
      autocomplete: 'email',
      prefix: '$',
      suffix: 'USD',
      clearable: true,
      showCount: true,
      size: 'large',
    };
    const result = TextInputPropsSchema.parse(props);
    expect(result.maxLength).toBe(100);
    expect(result.size).toBe('large');
  });

  it('should reject invalid size', () => {
    expect(() => TextInputPropsSchema.parse({ size: 'invalid' })).toThrow();
  });
});

describe('NumberInputPropsSchema', () => {
  it('should accept number input with defaults', () => {
    const props = {};
    const result = NumberInputPropsSchema.parse(props);
    expect(result.step).toBe(1);
    expect(result.showControls).toBe(true);
  });

  it('should accept full number input config', () => {
    const props = {
      min: 0,
      max: 100,
      step: 0.5,
      precision: 2,
      showControls: true,
      controlsPosition: 'sides',
      prefix: '$',
      suffix: '%',
      formatter: 'currency',
      locale: 'en-US',
    };
    const result = NumberInputPropsSchema.parse(props);
    expect(result.step).toBe(0.5);
    expect(result.precision).toBe(2);
  });
});

describe('CurrencyInputPropsSchema', () => {
  it('should use USD as default currency', () => {
    const props = {};
    const result = CurrencyInputPropsSchema.parse(props);
    expect(result.currency).toBe('USD');
    expect(result.locale).toBe('en-US');
  });

  it('should accept custom currency', () => {
    const props = {
      currency: 'EUR',
      locale: 'de-DE',
      allowNegative: true,
    };
    const result = CurrencyInputPropsSchema.parse(props);
    expect(result.currency).toBe('EUR');
  });
});

describe('SliderPropsSchema', () => {
  it('should accept slider with defaults', () => {
    const props = {};
    const result = SliderPropsSchema.parse(props);
    expect(result.min).toBe(0);
    expect(result.max).toBe(100);
    expect(result.step).toBe(1);
  });

  it('should accept range slider', () => {
    const props = {
      range: true,
      showTooltip: true,
      vertical: false,
    };
    const result = SliderPropsSchema.parse(props);
    expect(result.range).toBe(true);
  });
});

describe('DatePickerPropsSchema', () => {
  it('should use default date format', () => {
    const props = {};
    const result = DatePickerPropsSchema.parse(props);
    expect(result.format).toBe('YYYY-MM-DD');
    expect(result.showToday).toBe(true);
  });

  it('should accept custom format and constraints', () => {
    const props = {
      format: 'DD/MM/YYYY',
      minDate: '2024-01-01',
      maxDate: '2024-12-31',
      disabledDaysOfWeek: [0, 6], // Disable weekends
      showWeekNumbers: true,
    };
    const result = DatePickerPropsSchema.parse(props);
    expect(result.format).toBe('DD/MM/YYYY');
    expect(result.showWeekNumbers).toBe(true);
  });
});

describe('SelectPropsSchema', () => {
  it('should accept minimal select config', () => {
    const props = {
      options: [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ],
    };
    const result = SelectPropsSchema.parse(props);
    expect(result.multiple).toBe(false);
    expect(result.searchable).toBe(false);
  });

  it('should accept multi-select with search', () => {
    const props = {
      options: [
        { label: 'Red', value: 'red', icon: 'circle' },
        { label: 'Blue', value: 'blue', icon: 'circle' },
      ],
      multiple: true,
      searchable: true,
      clearable: true,
      maxTagCount: 3,
      virtual: true,
    };
    const result = SelectPropsSchema.parse(props);
    expect(result.multiple).toBe(true);
    expect(result.virtual).toBe(true);
  });
});

describe('FileUploadPropsSchema', () => {
  it('should accept file upload with defaults', () => {
    const props = {};
    const result = FileUploadPropsSchema.parse(props);
    expect(result.multiple).toBe(false);
    expect(result.dragDrop).toBe(true);
    expect(result.autoUpload).toBe(true);
  });

  it('should accept custom file upload config', () => {
    const props = {
      accept: '.pdf,.doc,.docx',
      multiple: true,
      maxSize: 10485760, // 10MB
      maxFiles: 5,
      uploadUrl: 'https://api.example.com/upload',
      uploadMethod: 'PUT',
      showProgress: true,
    };
    const result = FileUploadPropsSchema.parse(props);
    expect(result.multiple).toBe(true);
    expect(result.maxSize).toBe(10485760);
  });
});

describe('ImageUploadPropsSchema', () => {
  it('should use image/* as default accept', () => {
    const props = {};
    const result = ImageUploadPropsSchema.parse(props);
    expect(result.accept).toBe('image/*');
    expect(result.maxSize).toBe(5242880); // 5MB
  });

  it('should accept crop configuration', () => {
    const props = {
      crop: true,
      cropAspectRatio: 16 / 9,
      cropShape: 'rect',
      minWidth: 800,
      minHeight: 600,
    };
    const result = ImageUploadPropsSchema.parse(props);
    expect(result.crop).toBe(true);
    expect(result.cropShape).toBe('rect');
  });
});

describe('ColorPickerPropsSchema', () => {
  it('should use hex format by default', () => {
    const props = {};
    const result = ColorPickerPropsSchema.parse(props);
    expect(result.format).toBe('hex');
    expect(result.showAlpha).toBe(false);
  });

  it('should support RGBA format', () => {
    const props = {
      format: 'rgba',
      showAlpha: true,
      showPreset: true,
      presetColors: ['#FF0000', '#00FF00', '#0000FF'],
    };
    const result = ColorPickerPropsSchema.parse(props);
    expect(result.format).toBe('rgba');
    expect(result.showAlpha).toBe(true);
  });
});

describe('CodeEditorPropsSchema', () => {
  it('should use JavaScript as default language', () => {
    const props = {};
    const result = CodeEditorPropsSchema.parse(props);
    expect(result.language).toBe('javascript');
    expect(result.theme).toBe('vs-light');
    expect(result.lineNumbers).toBe(true);
  });

  it('should accept TypeScript with dark theme', () => {
    const props = {
      language: 'typescript',
      theme: 'vs-dark',
      minimap: true,
      wordWrap: 'on',
      fontSize: 16,
      height: '600px',
    };
    const result = CodeEditorPropsSchema.parse(props);
    expect(result.language).toBe('typescript');
    expect(result.theme).toBe('vs-dark');
  });
});

describe('RichTextEditorPropsSchema', () => {
  it('should accept rich text editor config', () => {
    const props = {
      toolbar: ['bold', 'italic', 'underline', 'link', 'image'],
      minHeight: '200px',
      uploadImage: true,
      uploadUrl: 'https://api.example.com/upload-image',
      mentions: true,
      emoji: true,
    };
    const result = RichTextEditorPropsSchema.parse(props);
    expect(result.uploadImage).toBe(true);
    expect(result.mentions).toBe(true);
  });
});

describe('AutocompletePropsSchema', () => {
  it('should accept autocomplete with defaults', () => {
    const props = {
      options: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ],
    };
    const result = AutocompletePropsSchema.parse(props);
    expect(result.minChars).toBe(1);
    expect(result.maxSuggestions).toBe(10);
    expect(result.freeSolo).toBe(false);
  });
});

describe('TagInputPropsSchema', () => {
  it('should accept tag input with defaults', () => {
    const props = {};
    const result = TagInputPropsSchema.parse(props);
    expect(result.allowDuplicates).toBe(false);
    expect(result.separators).toEqual([',']);
  });
});

describe('RatingInputPropsSchema', () => {
  it('should accept 5-star rating by default', () => {
    const props = {};
    const result = RatingInputPropsSchema.parse(props);
    expect(result.max).toBe(5);
    expect(result.allowHalf).toBe(false);
    expect(result.icon).toBe('star');
  });
});
