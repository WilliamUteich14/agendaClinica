// components/ModalGeneric.tsx
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath, revalidateTag } from "next/cache"; 
import { cookies } from "next/headers";
import Form from "@/app/components/Form";
import Submit from "@/app/components/Submit";
import { ButtonAdicionarProps } from "@/app/utils/types/modalGeneric";

export default function ButtonAdicionar({ config, params }: ButtonAdicionarProps) {

    async function newUser(prevState: any, formData: FormData): Promise<{ success?: string; error?: string }> {
        "use server";

        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        const apiEndpoint = formData.get('apiEndpoint') as string;
        const tags = formData.get('tags') as string;
        const method = formData.get('method') as string;
        const rawUrlRevalidate = formData.get('urlRevalidate') as string;
        const id = formData.get('id') as string | null;

        let tagsArray: string[] = [];
        try {
            tagsArray = tags ? JSON.parse(tags) : [];
        } catch {
            tagsArray = [];
        }

        let urlRevalidate: string[];
        try {
            const parsed = JSON.parse(rawUrlRevalidate);
            urlRevalidate = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            urlRevalidate = [rawUrlRevalidate];
        }

        const data: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
            if (!['apiEndpoint', 'tags', 'method', 'urlRevalidate', 'id'].includes(key)) {
                data[key] = value as string;
            }
        }

        if (id) {
            data.id = id;
        }

        for (const [key, value] of Object.entries(data)) {
            if (!value) {
                return { error: `O campo ${key} não pode estar vazio.` };
            }
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Cookie: cookieHeader,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                return { error: "Erro ao adicionar conteúdo." };
            }

            // Revalidação de paths e tags
            urlRevalidate.forEach(path => revalidatePath(path));
            tagsArray.forEach(tag => revalidateTag(tag)); // Revalida cada tag

            return { success: "Conteúdo adicionado com sucesso!" };
        } catch (error) {
            console.error("Erro ao adicionar conteúdo:", error);
            return { error: "Erro ao adicionar conteúdo. Tente novamente mais tarde." };
        }
    }

    return (
        <div className="w-full text-end">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    {config.action === "Adicionar" ? (
                        <Button variant="outline" className="bg-green-800 text-white hover:bg-green-600 font-semibold py-1 px-4 rounded-md transition duration-300 ease-in-out">
                            {config.action}
                        </Button>
                    ) : (
                        <Button className="bg-blue-800 text-white hover:bg-blue-700 font-semibold py-1 px-3 rounded-md transition duration-300 ease-in-out">
                            {config.action}
                        </Button>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{config.title}</AlertDialogTitle>
                        <AlertDialogDescription>{config.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div>
                        <Form action={newUser} className="grid gap-4 py-4 pb-0">
                            <input type="hidden" name="apiEndpoint" value={config.apiEndpoint} />
                            <input type="hidden" name="method" value={config.method} />
                            <input type="hidden" name="urlRevalidate" value={JSON.stringify(config.urlRevalidate)} />
                            <input type="hidden" name="tags" value={JSON.stringify(config.tags)} />
                            {params && <input type="hidden" name="id" value={params} />}

                            {config.fields.map((field) => (
                                <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={field.name} className="text-right">
                                        {field.label}
                                    </Label>
                                    {field.type === "select" && field.options ? (
                                        <Select name={field.name} defaultValue={field.options[0].value || undefined}>
                                            <SelectTrigger className="w-[340px]">
                                                <SelectValue placeholder={field.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup className="bg-white cursor-pointer">
                                                    <SelectLabel>{field.label}</SelectLabel>
                                                    {field.options.map((option) => (
                                                        <SelectItem key={option.value} value={option.value || "user"}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            defaultValue={config.initialValues?.[field.name]}
                                            className="col-span-3"
                                        />
                                    )}
                                </div>
                            ))}

                            <AlertDialogFooter>
                                <Submit className="bg-blue-800 w-full hover:bg-blue-700 text-white" type="submit">Salvar</Submit>
                            </AlertDialogFooter>
                        </Form>
                        <AlertDialogCancel className="bg-red-700 w-full text-white hover:bg-red-600 hover:textwhite hover:text-white">Fechar</AlertDialogCancel>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}