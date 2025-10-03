export class Player {
    static create(playbook: () => Promise<void>): Player {
        return new Player(playbook);
    }

    private constructor(private playbook: () => Promise<void>) { }

    play(): void {
        this.playbook().catch(error => {
            if (error instanceof Error) {
                const message = error.message.replace(/\n/g, '\n |  ');

                console.error('\x1b[1;31m |  ' + message + '\x1b[0m');
            } else {
                throw error;
            }
        });
    }
}