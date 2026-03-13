import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
  forwardRef,
} from 'react'

interface ButtonPropsBase {
  classNames?: string
  children: ReactNode
  href?: string
  ref?: React.Ref<HTMLButtonElement>
  isLoading?: boolean
}

type ButtonProps = ButtonPropsBase & ButtonHTMLAttributes<HTMLButtonElement>
type AnchorProps = ButtonPropsBase & AnchorHTMLAttributes<HTMLAnchorElement>

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | AnchorProps>(({
  classNames = '',
  href,
  children,
  isLoading,
  ...rest
}, ref) => {
  if (isLoading) {
    return (
      <button
        className={`btn ${classNames} loading`}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        <span>
          <span className='spinner'></span> Please wait
        </span>
      </button>
    )
  }

  if (href) {
    return (
      <a
        className={`btn ${classNames}`}
        href={href}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={ref as React.Ref<HTMLAnchorElement>}
      >
        <span>{children}</span>
      </a>
    )
  } else {
    return (
      <button
        className={`btn ${classNames}`}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        <span>{children}</span>
      </button>
    )
  }
})

Button.displayName = 'Button'

export default Button
