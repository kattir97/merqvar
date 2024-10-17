import { useParams } from "@remix-run/react";

export default function EditWord() {
  const params = useParams();
  return <h1>Edit {params.word}</h1>;
}
