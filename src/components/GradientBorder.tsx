interface Props {
  children: React.ReactNode
  className?: string
}

const GradientBorder: React.FC<Props> = ({ children, className }) => {
  return (
    <div
      className={`bg-gradient-to-r from-[#DF4DBF] to-[#572EFF] p-[2px] ${className}`}
    >
      {children}
    </div>
  )
}

export default GradientBorder
