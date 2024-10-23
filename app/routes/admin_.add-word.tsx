import { Form } from "@remix-run/react";
import { Container } from "~/components/container";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function AddWord() {
  return (
    <Container>
      <Form>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div>
              <Label htmlFor="headword">Слово</Label>
              <Input id="headword" />
            </div>
          </div>
          <div>
            <Label htmlFor="headword">Перевод</Label>
            <div className="flex flex-col gap-1">
              <Input id="headword" />
              <Input id="headword" />
              <Input id="headword" />
            </div>
          </div>
        </div>
      </Form>
    </Container>
  );
}
