import { engine } from "../getEngine";

/**
 * Centralized static class for managing all game sounds.
 * Provides constants for sound paths and convenience methods for playback.
 */
export class SoundManager {
    // ========================
    // Sound Path Constants
    // ========================

    /** Keyboard/menu button click sound */
    static readonly KEYBOARD_CLICK = "main/sounds/menu_click_06.ogg";

    /** Generic button click sound */
    static readonly BUTTON_CLICK = "main/sounds/button_click_02.ogg";

    /** Button hover sound */
    static readonly BUTTON_HOVER = "main/sounds/sfx-hover.wav";

    /** Button press sound */
    static readonly BUTTON_PRESS = "main/sounds/sfx-press.wav";

    /** Main background music */
    static readonly BGM_MAIN = "main/sounds/bgm-main.mp3";

    // ========================
    // SFX Playback Methods
    // ========================

    /** Play keyboard/menu click sound */
    static playKeyboardClick(): void {
        engine().audio.sfx.play(this.KEYBOARD_CLICK);
    }

    /** Play button hover sound */
    static playButtonHover(): void {
        engine().audio.sfx.play(this.BUTTON_HOVER);
    }

    /** Play button press sound */
    static playButtonPress(): void {
        engine().audio.sfx.play(this.BUTTON_PRESS);
    }

    /** Play generic button click sound */
    static playButtonClick(): void {
        engine().audio.sfx.play(this.BUTTON_CLICK);
    }

    // ========================
    // BGM Playback Methods
    // ========================

    /** Play main background music */
    static playBGM(volume: number = 0.5): void {
        engine().audio.bgm.play(this.BGM_MAIN, { volume });
    }

    /** Stop background music */
    static stopBGM(): void {
        engine().audio.bgm.current?.stop();
    }
}
