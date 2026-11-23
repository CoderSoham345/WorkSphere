import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Modal } from '@/components/common/Modal';

describe('Modal focus trap', () => {
  it('wraps Tab from last focusable element to first and Shift+Tab from first to last', () => {
    render(
      <div>
        <button type="button" data-testid="outside-btn">
          Outside
        </button>
        <Modal isOpen onClose={jest.fn()} title="Book Desk">
          <input type="text" data-testid="first-input" />
          <button type="button" data-testid="last-btn">
            Confirm
          </button>
        </Modal>
      </div>
    );

    const dialog = screen.getByTestId('modal-dialog');
    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    const lastBtn = screen.getByTestId('last-btn');

    lastBtn.focus();
    expect(document.activeElement).toBe(lastBtn);

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastBtn);
  });

  it('closes on Escape key press and restores focus to the triggering element', async () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" data-testid="open-modal-btn" onClick={() => setOpen(true)}>
            Book Desk
          </button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Review">
            <button type="button">Submit</button>
          </Modal>
        </div>
      );
    };

    render(<Wrapper />);
    const triggerBtn = screen.getByTestId('open-modal-btn');
    triggerBtn.focus();
    fireEvent.click(triggerBtn);

    expect(screen.getByTestId('modal-dialog')).toBeTruthy();
    fireEvent.keyDown(screen.getByTestId('modal-dialog'), { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('modal-dialog')).toBeNull();
      expect(document.activeElement).toBe(triggerBtn);
    });
  });
});
