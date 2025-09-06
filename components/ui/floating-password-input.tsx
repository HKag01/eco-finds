import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FloatingPasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  label: string
  error?: string
  showToggle?: boolean
  rightIcon?: React.ReactNode
}

const FloatingPasswordInput = React.forwardRef<HTMLInputElement, FloatingPasswordInputProps>(
  ({ className, label, error, showToggle = true, rightIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    
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
          type={showPassword ? "text" : "password"}
          className={cn(
            "peer h-14 w-full rounded-md border border-input bg-background px-3 pt-4 pb-2 text-base ring-offset-background transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            (showToggle || rightIcon) && "pr-12",
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
        
        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {rightIcon && (
            <div className="mr-1">
              {rightIcon}
            </div>
          )}
          {showToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    )
  }
)

FloatingPasswordInput.displayName = "FloatingPasswordInput"

export { FloatingPasswordInput }