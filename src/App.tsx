/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/** escribe esto en Make changes...
 *  Añade la librería jspdf a las dependencias del proyecto en el archivo package.json */
import jsPDF from 'jspdf';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Calculator,
  FileText,
  ChevronLeft,
  Info,
  Delete,
  X,
  Menu,
  User,
  History
} from 'lucide-react';
import { Screen, AccountData, AccountItem } from './types';

// --- Components ---

const SplashScreen = ({ onFinish }: { onFinish: () => void; key?: string }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary overflow-hidden"
    >
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary-fixed to-secondary flex items-center justify-center shadow-2xl"
        >
          <Wallet className="text-primary w-12 h-12" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-manrope font-extrabold text-4xl tracking-tighter text-secondary-fixed mb-4"
        >
          MEFDIM CUENTAS
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/80 text-lg max-w-xs font-medium"
        >
          Para la gestión de cuentas y notas
        </motion.p>
      </div>

      <div className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-secondary-fixed/20"></div>
          <div className="absolute w-10 h-10 rounded-full border-t-2 border-secondary-fixed animate-spin"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
          <Info className="text-secondary-fixed w-4 h-4" />
          <span className="text-white/70 text-[11px] font-semibold uppercase tracking-widest">
            Iniciando entorno seguro...
          </span>
        </div>
      </div>

      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    </motion.div>
  );
};

const CuentasScreen = ({ loadedInvoice, onInvoiceLoaded }: { loadedInvoice: any, onInvoiceLoaded: () => void }) => {
  const [data, setData] = useState<AccountData>(() => {
    const saved = localStorage.getItem('cuentasData');
    return saved
      ? JSON.parse(saved)
      : {
        discountValue: '',
        pageTitle: '',
        clientName: '',
        address: '',
        neighborhood: '',
        phone: '',
        city: 'Sibundoy',
        items: Array(3).fill(null).map((_, i) => ({
          id: String(i),
          description: '',
          value: ''
        })),
        withDiscount: false,
        additionalNotes: ''
      };
  });

  const [showConfirm, setShowConfirm] = useState(false);
  //estado para número de factura automático
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const saved = localStorage.getItem('invoiceNumber');
    return saved ? Number(saved) : 1;
  });

  //guarda el número de factura automático
  useEffect(() => {
    localStorage.setItem('invoiceNumber', String(invoiceNumber));
  }, [invoiceNumber]);

  //función x eliminar fila individual
  const deleteRow = (index: number) => {
    if (data.items.length <= 1) return;

    const newItems = data.items.filter((_, i) => i !== index);

    setData({
      ...data,
      items: newItems
    });
  };

  //FUNCIÓN AGREGAR FILA
  const addRow = () => {
    const newItem = {
      id: String(Date.now()),
      description: '',
      value: ''
    };

    setData({
      ...data,
      items: [...data.items, newItem]
    });
  };

  //FUNCIÓN BORRAR TODO
  const clearAll = () => {
    const emptyData = {
      clientName: '',
      address: '',
      neighborhood: '',
      phone: '',
      city: 'Sibundoy',
      items: Array(3).fill(null).map((_, i) => ({
        id: String(i),
        description: '',
        value: ''
      })),
      withDiscount: false,
      additionalNotes: ''
    };

    setData(emptyData);
    localStorage.removeItem('cuentasData');
  };

  const [showMenu, setShowMenu] = useState(false);

  //crear la funciòn para generar PDF
  const generatePDF = () => {
    const newInvoice = {
      id: String(Date.now()),
      invoiceNumber,
      date: new Date().toLocaleDateString('es-CO'),
      clientName: data.clientName,
      address: data.address,
      neighborhood: data.neighborhood,
      phone: data.phone,
      city: data.city,
      items: data.items,
      total: finalTotal,
      withDiscount: data.withDiscount,
      discountValue: data.discountValue,
      additionalNotes: data.additionalNotes,
      pageTitle: data.pageTitle,
    };

    const savedHistory = localStorage.getItem('invoiceHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    localStorage.setItem('invoiceHistory', JSON.stringify([newInvoice, ...history]));
    const doc = new jsPDF();
    const formattedInvoice = String(invoiceNumber).padStart(4, '0');

    let y = 20;

    // Izquierda
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text('MEFDIM', 14, y);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150);
    doc.text('Gestión de cuentas', 14, y + 7);
    doc.setTextColor(0);

    // Derecha
    const fecha = new Date().toLocaleDateString('es-CO');
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${fecha}`, 196, y, { align: 'right' });

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(`Factura #${formattedInvoice}`, 196, y + 7, { align: 'right' });

    y = 35;
    doc.line(14, y, 196, y);
    y += 10;

    // 👤 CLIENTE
    doc.setFontSize(12);
    doc.text(`Cliente: ${data.clientName}`, 14, y);
    y += 6;
    doc.text(`Dirección: ${data.address}`, 14, y);
    y += 6;
    doc.text(`Barrio: ${data.neighborhood}`, 14, y);
    y += 6;
    doc.text(`Teléfono: ${data.phone}`, 14, y);
    y += 6;
    doc.text(`Ciudad: ${data.city}`, 14, y);

    y += 10;

    // 📊 TABLA
    doc.setFont(undefined, 'bold');
    doc.text('Descripción', 14, y);
    doc.text('Valor', 196, y, { align: 'right' });

    y += 5;
    doc.line(14, y, 196, y);
    y += 5;

    doc.setFont(undefined, 'normal');

    data.items.forEach(item => {
      if (item.description || item.value) {
        doc.text(item.description, 14, y);
        doc.text(`$ ${item.value}`, 196, y, { align: 'right' });
        y += 6;
      }
    });

    y += 10;
    doc.line(14, y, 196, y);

    y += 8;

    // 💰 TOTAL
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    if (data.withDiscount && discount > 0) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Subtotal: $ ${total.toLocaleString('es-CO')}`, 196, y, { align: 'right' });
      y += 6;
      doc.text(`Descuento: - $ ${discount.toLocaleString('es-CO')}`, 196, y, { align: 'right' });
      y += 6;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: $ ${finalTotal.toLocaleString('es-CO')}`, 196, y, { align: 'right' });

    //Guarda Nota en la factura, solo si hay nota
    if (data.additionalNotes.trim()) {
      y += 10;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Notas / Observaciones:', 14, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(data.additionalNotes, 180);
      doc.text(lines, 14, y);
    }
    doc.save('factura.pdf');
  };

  // 🔥 FUNCIÓN AGREGADA evita que estas palabras queden en Mayusculas
  const capitalizeWords = (text: string) => {
    const exceptions = ['de', 'del', 'la', 'las', 'los', 'y', 'el'];

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (exceptions.includes(word) && index !== 0) {
          return word; // se queda en minúscula
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  // 🔥 ESTA ES LA NUEVA FUNCIÓN
  const handleChange = (field: string, value: string) => {
    setData({
      ...data,
      [field]: capitalizeWords(value)
    });
  };
  //función para formatear con separadores de miles
  const formatNumber = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, '');
    return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  //Cambio para formatear decimales
  const handleItemChange = (index: number, field: keyof AccountItem, value: string) => {
    const newItems = [...data.items];

    if (field === 'value') {
      value = formatNumber(value);
    }

    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, items: newItems });
  };

  const total = data.items.reduce((acc, item) => {
    const val = parseFloat(String(item.value).replace(/\./g, '')) || 0;
    return acc + val;
  }, 0);
  const discount = parseFloat(String(data.discountValue || '0').replace(/\./g, '')) || 0;
  const finalTotal = data.withDiscount ? total - discount : total;


  //para guardar automaticamente
  useEffect(() => {
    localStorage.setItem('cuentasData', JSON.stringify(data));
  }, [data]);

  //para cagar la factura del historial
  useEffect(() => {
    if (loadedInvoice) {
      setData({
        pageTitle: loadedInvoice.pageTitle || 'CUENTAS',
        clientName: loadedInvoice.clientName,
        address: loadedInvoice.address,
        neighborhood: loadedInvoice.neighborhood,
        phone: loadedInvoice.phone,
        city: loadedInvoice.city,
        items: loadedInvoice.items,
        withDiscount: loadedInvoice.withDiscount,
        discountValue: loadedInvoice.discountValue,
        additionalNotes: loadedInvoice.additionalNotes,
      });
      onInvoiceLoaded();
    }
  }, [loadedInvoice]);

  return (
    <div className="flex flex-col pb-24">

      <main className="px-6">
        <div className="flex justify-between items-baseline mb-6">
          {/* Este input para titulo editable */}
          <input
            type="text"
            value={data.pageTitle || 'CUENTAS'}
            onChange={e => setData({ ...data, pageTitle: e.target.value.toUpperCase() })}
            className="font-manrope font-extrabold text-3xl text-primary bg-transparent border-none outline-none w-full"
          />
          <span className="text-gray-600 text-sm whitespace-nowrap">
            {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <section className="bg-gray-100/50 rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1"></label>
            <input
              type="text"
              placeholder="Ingrese nombre completo"
              className="w-full bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-secondary/20 outline-none"
              value={data.clientName}
              onChange={e => handleChange('clientName', e.target.value)}
            />
            {showConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                  <h3 className="font-bold text-primary text-lg mb-2">¿Borrar todo?</h3>
                  <p className="text-gray-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => { clearAll(); setShowConfirm(false); }}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm"
                    >
                      Sí, borrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1"></label>
            <input
              type="text"
              placeholder="Sibundoy"
              className="w-full bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-secondary/20 outline-none"
              value={data.city}
              onChange={e => handleChange('city', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1"></label>
            <input
              type="text"
              placeholder="Barrio / Sector"
              className="w-full bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-secondary/20 outline-none"
              value={data.neighborhood}
              onChange={e => handleChange('neighborhood', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1"></label>
            <input
              type="text"
              placeholder="Calle, Carrera..."
              className="w-full bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-secondary/20 outline-none"
              value={data.address}
              onChange={e => handleChange('address', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1"></label>
            <input
              type="tel"
              placeholder=" +57 300 000 0000"
              className="pl-3 pr-3 py-2 border rounded-md"
              value={data.phone}
              onChange={e => {
                const formatted = e.target.value.replace(/[^\d\s+-]/g, '');
                setData({ ...data, phone: formatted });
              }}
            />
          </div>

        </section>

        <section className="mb-8">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">
            <span>Descripción</span>
            <span>Valor</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
            {data.items.map((item, idx) => (
              <div key={item.id} className="flex items-center px-4 py-3 gap-2">
                <input
                  type="text"
                  placeholder={idx === 0 ? "Descripción" : ""}
                  className="flex-1 min-w-0 text-sm border-none focus:ring-0 outline-none placeholder:text-gray-300"
                  value={item.description}
                  onChange={e => handleItemChange(idx, 'description', e.target.value)}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-secondary font-bold">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-16 text-right text-sm border-none focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={item.value}
                    onChange={e => handleItemChange(idx, 'value', e.target.value)}
                  />
                </div>
                {/* 🔥 BOTÓN ELIMINAR */}
                <button
                  type="button"
                  onClick={() => deleteRow(idx)}
                  className="shrink-0 text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center gap-6 mb-8">
          {/* Menú de Opciones */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-full bg-primary text-white font-manrope font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            MEFDIM
          </button>
          {/* Menú de Opciones */}
          {showMenu && (
            <div className="mt-4 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-3">

              {/* boton de borrar todo pregunta antes */}
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-500 text-white py-2 rounded-lg"
              >
                🗑 Borrar todo
              </button>

              <button
                onClick={generatePDF}
                className="bg-primary text-white py-2 rounded-lg"
              >
                📄 Generar PDF
              </button>

              {/* BOTÓN AGREGAR FILA */}
              <button
                onClick={addRow}
                className="bg-green-500 text-white py-2 rounded-lg"
              >
                ➕ Agregar fila
              </button>

              {/*botón Eliminar fila individual */}
              <button
                type="button"
                onClick={() => deleteRow(idx)}
                className="text-red-500"
              >

              </button>

            </div>
          )}

          <div className="text-center">
            <div className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-widest">TOTAL =</div>
            <div className="text-primary font-manrope font-extrabold text-5xl tracking-tighter">
              {finalTotal.toLocaleString('es-CO')}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setData({ ...data, withDiscount: !data.withDiscount })}
                className={`w-12 h-6 rounded-full transition-colors relative ${data.withDiscount ? 'bg-secondary' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.withDiscount ? 'left-7' : 'left-1'}`} />
              </button>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total con descuento</span>
            </div>

            {data.withDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-secondary font-bold">$</span>
                <input
                  type="text"
                  placeholder="Valor a descontar"
                  className="bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none text-center"
                  value={data.discountValue || ''}
                  onChange={e => setData({ ...data, discountValue: formatNumber(e.target.value) })}
                />
              </div>
            )}
          </div>
        </div>

        <section className="space-y-4">
          <textarea
            placeholder="Notas, observaciones, acuerdos de pago o detalles del pedido..."
            className="w-full h-32 bg-gray-100/50 rounded-2xl p-6 text-sm border-none focus:ring-2 focus:ring-secondary/20 outline-none resize-none"
            value={data.additionalNotes}
            onChange={e => setData({ ...data, additionalNotes: e.target.value })}
          />
        </section>
      </main>
    </div >
  );
};

const CalculadoraScreen = () => {

  const buttons = [
    { label: 'C', type: 'clear', className: 'bg-red-100 text-red-600' },
    { label: 'backspace', type: 'icon', icon: <Delete className="w-6 h-6" />, className: 'bg-gray-100 text-primary' },
    { label: '%', type: 'op', className: 'bg-gray-100 text-primary' },
    { label: '÷', type: 'op', className: 'bg-primary text-white' },
    { label: '7', type: 'num' },
    { label: '8', type: 'num' },
    { label: '9', type: 'num' },
    { label: '×', type: 'op', className: 'bg-primary text-white' },
    { label: '4', type: 'num' },
    { label: '5', type: 'num' },
    { label: '6', type: 'num' },
    { label: '−', type: 'op', className: 'bg-primary text-white' },
    { label: '1', type: 'num' },
    { label: '2', type: 'num' },
    { label: '3', type: 'num' },
    { label: '+', type: 'op', className: 'bg-primary text-white' },
    { label: '0', type: 'num', colSpan: 2 },
    { label: '.', type: 'num' },
    { label: '=', type: 'equal', className: 'bg-secondary text-white shadow-lg shadow-secondary/20' },
  ];

  const [lastWasOperator, setLastWasOperator] = useState(false);
  const [display, setDisplay] = useState(() => localStorage.getItem('calc_display') || '0');
  const [expression, setExpression] = useState(() => localStorage.getItem('calc_expression') || '');
  const [history, setHistory] = useState(() => localStorage.getItem('calc_history') || '');

  useEffect(() => {
    localStorage.setItem('calc_display', display);
  }, [display]);

  useEffect(() => {
    localStorage.setItem('calc_expression', expression);
  }, [expression]);

  useEffect(() => {
    localStorage.setItem('calc_history', history);
  }, [history]);

  

  const formatMoney = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleButtonClick = (btn: any) => {

    // 🔢 NÚMEROS
    if (btn.type === 'num') {
      setDisplay(prev => {
        const raw = prev.replace(/\./g, '');
        const newValue = lastWasOperator ? btn.label : (raw === '0' ? btn.label : raw + btn.label);

        return formatMoney(newValue);
      });

      setExpression(prev => prev + btn.label);
      setLastWasOperator(false);
    }

    // ➕ OPERADORES
    if (btn.type === 'op') {
      if (expression === '') return;

      setDisplay(prev => prev + ' ' + btn.label + ' ');
      setExpression(prev => prev + btn.label);
      setLastWasOperator(true);
    }

    // 🧹 LIMPIAR
    if (btn.type === 'clear') {
      setDisplay('0');
      setExpression('');
      setHistory('');
      setLastWasOperator(false);
      if (btn.type === 'clear') {
        setDisplay('0');
        setExpression('');
        setHistory('');
        setLastWasOperator(false);
        localStorage.removeItem('calc_display');
        localStorage.removeItem('calc_expression');
        localStorage.removeItem('calc_history');
      }
    }

    // ⌫ BACKSPACE
    if (btn.label === 'backspace') {
      setDisplay(prev => {
        const raw = prev.replace(/\./g, '');
        if (raw.length <= 1) return '0';

        return formatMoney(raw.slice(0, -1));
      });

      setExpression(prev => prev.slice(0, -1));
    }

    // 🟰 IGUAL
    if (btn.label === '=') {
      console.log('expression:', expression);
      console.log('display:', display);
      try {
        let expr = expression
          .replace(/\./g, '')
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-');

        console.log('expr limpio:', expr);
        // ... resto del código

        expr = expr.replace(
          /(\d+)%(\d+)/,
          (_, pct, base) => {
            console.log('match! pct:', pct, 'base:', base);
            return String(Number(base) * Number(pct) / 100);
          }
        );

        console.log('después paso 1:', expr);

        // 1. Caso 74%194 → "X% de Y"
        expr = expr.replace(
          /(\d+)%(\d+)/,
          (_, pct, base) => String(Number(base) * Number(pct) / 100)
        );

        // 2. Caso 200+10% o 500*10%
        expr = expr.replace(
          /(\d+)([\+\-\*\/])(\d+)%/,
          (_, base, op, pct) => {
            const b = Number(base), p = Number(pct);
            return (op === '+' || op === '-')
              ? `${b}${op}${b * p / 100}`
              : `${b}${op}${p / 100}`;
          }
        );

        // 3. Caso solo 10% → 0.1
        expr = expr.replace(/^(\d+)%$/, (_, n) => String(Number(n) / 100));

        const result = eval(expr);

        const [intPart, decPart] = String(result).split('.');
        const formattedInt = formatMoney(intPart);
        const formatted = decPart ? `${formattedInt}.${decPart}` : formattedInt;

        setHistory(display);
        setDisplay(formatted);
        setExpression(String(result));
        setLastWasOperator(false);
      } catch {
        setDisplay('Error');
      }
    }
  };

  return (
    <div className="flex flex-col pb-24 h-full">
      <header className="fixed top-0 left-0 w-full z-10 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <ChevronLeft className="text-primary w-6 h-6" />
          </button>
          <h1 className="font-manrope font-bold text-lg uppercase tracking-wider text-primary">Calculadora</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-xs">
          JD
        </div>
      </header>

      <main className="flex-grow pt-20 px-6 flex flex-col">
        <section className="mb-8 flex flex-col items-end justify-end min-h-[180px] px-4 py-6 rounded-xl bg-gray-100/50 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
          <span className="text-gray-400 font-semibold text-[10px] tracking-widest uppercase mb-1">Operación Anterior</span>
          <div className="text-gray-400 font-medium text-xl tracking-tight mb-2">
            {history}
          </div>
          <div className="text-primary font-manrope font-extrabold text-5xl tracking-tighter">
            {display}
          </div>
        </section>

        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => handleButtonClick(btn)}
              className={`
                h-12 text-base flex items-center justify-center rounded-xl font-manrope font-bold text-xl transition-all active:scale-95
                ${btn.colSpan === 2 ? 'col-span-2 aspect-auto' : ''}
                ${btn.type === 'num' ? 'bg-white text-primary shadow-sm hover:bg-gray-50' : ''}
                ${btn.className || ''}
              `}
            >
              {btn.type === 'icon' ? btn.icon : btn.label}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-secondary-fixed/30 flex items-center gap-4">
          <Info className="text-secondary w-6 h-6 shrink-0" />
          <p className="text-sm text-secondary font-medium leading-tight">
            Usa la calculadora para estimar tus ahorros mensuales antes de registrar una nueva cuenta.
          </p>
        </div>
      </main>
    </div>
  );
};

const NotasScreen = () => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notasData');
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    localStorage.setItem('notasData', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newTitle.trim() && !newText.trim()) return;
    const note = {
      id: String(Date.now()),
      title: newTitle,
      text: newText,
      pinned: false,
      date: new Date().toLocaleDateString('es-CO')
    };
    setNotes([note, ...notes]);
    setNewTitle('');
    setNewText('');
    setShowForm(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n: any) => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(notes.map((n: any) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ));
  };

  const filtered = notes
    .filter((n: any) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="flex flex-col pb-24">
      <header className="flex justify-between items-center px-6 py-4">
        <h2 className="font-manrope font-bold text-lg uppercase tracking-wider text-primary">Notas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl"
        >
          +
        </button>
      </header>

      <main className="px-6">
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar notas..."
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none mb-4"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Formulario nueva nota */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Título"
              className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none font-bold"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Escribe tu nota..."
              className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none resize-none h-24"
              value={newText}
              onChange={e => setNewText(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={addNote}
                className="px-4 py-2 rounded-xl text-sm text-white bg-primary font-bold"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Lista de notas */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No hay notas aún. Toca + para crear una.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((note: any) => (
              <div
                key={note.id}
                className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${note.pinned ? 'border-secondary' : 'border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-primary text-sm">{note.title}</span>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => togglePin(note.id)} className="text-lg">
                      {note.pinned ? '📌' : '📍'}
                    </button>
                    <button onClick={() => deleteNote(note.id)}>
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{note.text}</p>
                <span className="text-[10px] text-gray-300 mt-2 block">{note.date}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const HistorialScreen = ({ onLoadInvoice }: { onLoadInvoice: (invoice: any) => void }) => {
  const [invoices, setInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('invoiceHistory');
    console.log('historial guardado:', saved); // 👈 agrega esto
    return saved ? JSON.parse(saved) : [];
  });

  const [selected, setSelected] = useState<any>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    localStorage.setItem('invoiceHistory', JSON.stringify(updated));
    setShowConfirmDelete(null);
  };

  const regeneratePDF = (inv: any) => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('MEFDIM', 14, 20);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Gestión de cuentas', 14, 26);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURA', 196, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Fecha: ${inv.date}`, 196, 26, { align: 'right' });

    y = 40;
    doc.line(14, y, 196, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Cliente: ${inv.clientName}`, 14, y); y += 6;
    doc.text(`Dirección: ${inv.address}`, 14, y); y += 6;
    doc.text(`Barrio: ${inv.neighborhood}`, 14, y); y += 6;
    doc.text(`Teléfono: ${inv.phone}`, 14, y); y += 6;
    doc.text(`Ciudad: ${inv.city}`, 14, y);

    y += 10;
    doc.setFont(undefined, 'bold');
    doc.text('Descripción', 14, y);
    doc.text('Valor', 196, y, { align: 'right' });
    y += 5;
    doc.line(14, y, 196, y);
    y += 5;
    doc.setFont(undefined, 'normal');

    inv.items.forEach((item: any) => {
      if (item.description || item.value) {
        doc.text(item.description, 14, y);
        doc.text(`$ ${item.value}`, 196, y, { align: 'right' });
        y += 6;
      }
    });

    y += 10;
    doc.line(14, y, 196, y);
    y += 8;

    if (inv.withDiscount) {
      const discount = parseFloat(String(inv.discountValue || '0').replace(/\./g, '')) || 0;
      const subtotal = inv.items.reduce((acc: number, item: any) => {
        return acc + (parseFloat(String(item.value).replace(/\./g, '')) || 0);
      }, 0);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Subtotal: $ ${subtotal.toLocaleString('es-CO')}`, 196, y, { align: 'right' }); y += 6;
      doc.text(`Descuento: - $ ${discount.toLocaleString('es-CO')}`, 196, y, { align: 'right' }); y += 6;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: $ ${inv.total.toLocaleString('es-CO')}`, 196, y, { align: 'right' });

    if (inv.additionalNotes?.trim()) {
      y += 10;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Notas / Observaciones:', 14, y); y += 6;
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(inv.additionalNotes, 180);
      doc.text(lines, 14, y);
    }

    doc.save(`factura-${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="flex flex-col pb-24">
      <header className="flex justify-between items-center px-6 py-4">
        <h2 className="font-manrope font-bold text-lg uppercase tracking-wider text-primary">Historial</h2>
        <span className="text-gray-400 text-xs">{invoices.length} facturas</span>
      </header>

      <main className="px-6">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No hay facturas guardadas aún.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Factura #{inv.invoiceNumber}</span>
                    <p className="font-bold text-primary">{inv.clientName || 'Sin nombre'}</p>
                    <p className="text-gray-400 text-xs">{inv.date}</p>
                  </div>
                  <span className="font-manrope font-extrabold text-secondary text-lg">
                    ${inv.total.toLocaleString('es-CO')}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { onLoadInvoice(inv); }}
                    className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold"
                  >
                    ✏️ Cargar
                  </button>
                  <button
                    onClick={() => regeneratePDF(inv)}
                    className="flex-1 py-2 rounded-xl bg-gray-100 text-primary text-xs font-bold"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(inv.id)}
                    className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-primary text-lg mb-2">¿Eliminar factura?</h3>
            <p className="text-gray-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteInvoice(showConfirmDelete)}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [loadedInvoice, setLoadedInvoice] = useState<any>(null);

  const handleLoadInvoice = (invoice: any) => {
    setLoadedInvoice(invoice);
    setScreen('cuentas');
  };


  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto relative overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <SplashScreen key="splash" onFinish={() => setScreen('cuentas')} />
        )}

        {screen !== 'splash' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            {screen === 'cuentas' && <CuentasScreen loadedInvoice={loadedInvoice} onInvoiceLoaded={() => setLoadedInvoice(null)} />}
            {screen === 'calculadora' && <CalculadoraScreen />}
            {screen === 'notas' && <NotasScreen />}
            {screen === 'historial' && <HistorialScreen onLoadInvoice={handleLoadInvoice} />}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pb-8 pt-4 px-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => setScreen('cuentas')}
                className={`flex flex-col items-center gap-1 transition-all ${screen === 'cuentas' ? 'text-secondary bg-secondary-fixed/30 px-4 py-2 rounded-xl scale-105' : 'text-gray-400 opacity-60'}`}
              >
                <Wallet className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cuentas</span>
              </button>

              <button
                onClick={() => setScreen('calculadora')}
                className={`flex flex-col items-center gap-1 transition-all ${screen === 'calculadora' ? 'text-secondary bg-secondary-fixed/30 px-4 py-2 rounded-xl scale-105' : 'text-gray-400 opacity-60'}`}
              >
                <Calculator className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Calculadora</span>
              </button>

              <button
                onClick={() => setScreen('notas')}
                className={`flex flex-col items-center gap-1 transition-all ${screen === 'notas' ? 'text-secondary bg-secondary-fixed/30 px-4 py-2 rounded-xl scale-105' : 'text-gray-400 opacity-60'}`}
              >
                <FileText className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Notas</span>
              </button>

              {/* botòn de historial */}
              <button
                onClick={() => setScreen('historial')}
                className={`flex flex-col items-center gap-1 transition-all ${screen === 'historial' ? 'text-secondary bg-secondary-fixed/30 px-4 py-2 rounded-xl scale-105' : 'text-gray-400 opacity-60'}`}
              >
                <History className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Historial</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}