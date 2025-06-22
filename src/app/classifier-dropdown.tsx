import { ClassifierData, ClassifierType, Connection, ConnectionType } from "./types";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { Arrow } from "./arrow";

interface Props {
	id: number, 
	classifiers: ClassifierData[], 
	connections: Connection[], 
	setConnections: Dispatch<SetStateAction<Connection[]>>
}

export function ClassifierDropdown({ id, classifiers, connections, setConnections }: Props) {
	const { type } = classifiers[id];

	let items: ClassifierData[] = [];
	let content: JSX.Element | JSX.Element[];

	items = classifiers.filter(c => c.id != id && c.name && c.name?.trim() != ""); // Filter out empty classifiers and yourself
	if (type == "interface") {
		items = items.filter(c => c.type == "interface"); // Filter further for interfaces
	} else if (type == "abstract class" || type == "class") {
		items = items.filter(c => c.type == "abstract class" || c.type == "class" || c.type == "interface"); // Filter further
	}

	if (items.length == 0 || type == "enumeration") {
		content = <DropdownMenuLabel>Nothing to extend or implement!</DropdownMenuLabel>
	} else {
		content = items.map((item, index) => (
			<DropdownMenuCheckboxItem checked={connections.filter(c => c.from == id && c.to == item.id).length > 0} key={index} onCheckedChange={checked => checked ? addConnection(item) : removeConnection(item)}>
				<Badge variant="secondary" className="rounded-full mr-2">{item.type == "interface" ? "implement" : "extend"}</Badge>
				<span>{item.name}</span>
			</DropdownMenuCheckboxItem>
		))
	}

	const removeConnection = (target: ClassifierData) => {
		setConnections(prev => prev.filter(c => c.from != id || c.to != target.id));
	}

	const addConnection = (target: ClassifierData) => {
		const from = id;
		const to = target.id;
		const type: ConnectionType = target.type == "interface" ? "implementation" : "extension";
		const key = `connection-${from}-${to}`;
		const path = <Arrow from={from} to={to} type={type} key={key} />;
		
		setConnections(prev => [...prev, { from, to, type, path }]);
	}



	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="absolute right-2 rounded-full w-6 h-6 px-0 font-bold">+</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{content}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}