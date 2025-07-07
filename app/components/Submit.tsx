"use client"

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

type SubmitProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export default function Submit(props: SubmitProps) {
    const { disabled, ...otherProps } = props
    const status = useFormStatus();
    return (
        <Button 
            className="bg-gray-500 text-white"
            {...otherProps} disabled={status.pending || disabled}
        >
            {status.pending ? "Processando..." : props.children}
        </Button>
    )
}
