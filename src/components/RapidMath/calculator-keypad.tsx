"use client"
import { Button } from "@/components/ui/button"
import { Delete, Divide, X, Minus, Plus, Eraser } from "lucide-react"

interface CalculatorKeypadProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export function CalculatorKeypad({ value, onChange, disabled }: CalculatorKeypadProps) {
  const handleNumberClick = (num: string) => {
    if (!disabled) {
      onChange(value + num)
    }
  }

  const handleSymbol = (symbol: string) => {
    if (!disabled) {
      onChange(value + symbol)
    }
  }

  const handleBackspace = () => {
    if (!disabled) {
      onChange(value.slice(0, -1))
    }
  }

  const handleClear = () => {
    if (!disabled) {
      onChange("")
    }
  }

  const buttonClass = "h-14 sm:h-16 text-xl sm:text-2xl font-semibold rounded-2xl transition-all active:scale-95 shadow-sm hover:shadow-md"
  const numberClass = `${buttonClass} bg-slate-50 hover:bg-white text-slate-900 border-2 border-slate-200 hover:border-blue-400`
  const actionClass = `${buttonClass} bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-100 hover:border-blue-300`
  const operatorClass = `${buttonClass} bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-2 border-indigo-100 hover:border-indigo-300`

  return (
    <div className="w-full grid grid-cols-4 gap-3 p-2">
      {/* Row 1 */}
      <Button onClick={handleClear} disabled={disabled} className={`${actionClass} col-span-1 border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300`}>
        <Eraser size={24} />
      </Button>
      <Button onClick={() => handleSymbol("/")} disabled={disabled} className={operatorClass}>
        <Divide size={24} />
      </Button>
      <Button onClick={() => handleSymbol("×")} disabled={disabled} className={operatorClass}>
        <X size={24} />
      </Button>
      <Button onClick={handleBackspace} disabled={disabled} className={`${actionClass} col-span-1`}>
        <Delete size={24} />
      </Button>

      {/* Row 2 */}
      {[7, 8, 9].map((num) => (
        <Button key={num} onClick={() => handleNumberClick(num.toString())} disabled={disabled} className={numberClass}>
          {num}
        </Button>
      ))}
      <Button onClick={() => handleSymbol("-")} disabled={disabled} className={operatorClass}>
        <Minus size={24} />
      </Button>

      {/* Row 3 */}
      {[4, 5, 6].map((num) => (
        <Button key={num} onClick={() => handleNumberClick(num.toString())} disabled={disabled} className={numberClass}>
          {num}
        </Button>
      ))}
      <Button onClick={() => handleSymbol("+")} disabled={disabled} className={operatorClass}>
        <Plus size={24} />
      </Button>

      {/* Row 4 (0 spans 2 cols) */}
      {[1, 2, 3].map((num) => (
        <Button key={num} onClick={() => handleNumberClick(num.toString())} disabled={disabled} className={numberClass}>
          {num}
        </Button>
      ))}
      <Button onClick={() => handleSymbol(".")} disabled={disabled} className={numberClass}>
        .
      </Button>

      {/* Row 5 */}
      <Button onClick={() => handleNumberClick("0")} disabled={disabled} className={`${numberClass} col-span-2`}>
        0
      </Button>

      {/* Empty spaces or extra functions could go here if needed, or layout adjustment */}
    </div>
  )
}
