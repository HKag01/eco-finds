import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string
  error?: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    React.useEffect(() => {
      setHasValue(props.value ? String(props.value).length > 0 : false)
    }, [props.value])

    const isLabelFloating = isFocused || hasValue

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "peer h-14 w-full rounded-md border border-input bg-background px-3 pt-4 pb-2 text-base ring-offset-background transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        <label
          className={cn(
            "absolute left-3 text-muted-foreground transition-all duration-200 ease-in-out pointer-events-none",
            "peer-focus:text-primary",
            error && "peer-focus:text-destructive",
            isLabelFloating
              ? "top-2 text-xs"
              : "top-1/2 -translate-y-1/2 text-base"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)

FloatingInput.displayName = "FloatingInput"

export { FloatingInput }